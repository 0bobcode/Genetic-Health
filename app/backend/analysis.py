"""
Analysis wrapper that runs the genetic health pipeline in a background thread
and returns structured JSON for the frontend.
"""

import sys
import uuid
import threading
from pathlib import Path
from collections import defaultdict

SCRIPTS_DIR = Path(__file__).resolve().parent.parent.parent / "scripts"
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
sys.path.insert(0, str(SCRIPTS_DIR))

from run_full_analysis import (
    load_genome,
    load_pharmgkb,
    analyze_lifestyle_health,
    load_clinvar_and_analyze,
    classify_zygosity,
)
from comprehensive_snp_database import COMPREHENSIVE_SNPS

jobs: dict = {}


def create_job() -> str:
    job_id = uuid.uuid4().hex[:12]
    jobs[job_id] = {
        "status": "pending",
        "step": "",
        "steps_completed": [],
        "progress": 0,
        "results": None,
        "error": None,
    }
    return job_id


STEPS = [
    "Loading genome",
    "Loading PharmGKB data",
    "Running lifestyle analysis",
    "Scanning ClinVar database",
    "Building results",
]


def _set_step(job_id: str, step: str, progress: int):
    j = jobs[job_id]
    if j["step"] and j["step"] not in j["steps_completed"]:
        j["steps_completed"].append(j["step"])
    j["step"] = step
    j["progress"] = progress


def _build_structured_results(
    health_results: dict,
    disease_findings: dict | None,
    disease_stats: dict | None,
    genome_count: int,
) -> dict:
    findings_dict = {f["gene"]: f for f in health_results["findings"]}

    affected, carriers, het_unknown = [], [], []
    if disease_findings:
        for f in disease_findings.get("pathogenic", []) + disease_findings.get("likely_pathogenic", []):
            status, desc = classify_zygosity(f)
            f["zygosity_status"] = status
            f["zygosity_description"] = desc
            if status == "AFFECTED":
                affected.append(f)
            elif status == "CARRIER":
                carriers.append(f)
            else:
                het_unknown.append(f)

    supplements = _build_supplements(findings_dict)
    diet_recs = _build_diet_recs(findings_dict)
    lifestyle_recs = _build_lifestyle_recs(findings_dict)
    monitoring = _build_monitoring(findings_dict, disease_findings)

    by_category = defaultdict(list)
    for f in health_results["findings"]:
        by_category[f["category"]].append(f)

    return {
        "summary": health_results["summary"],
        "genome_count": genome_count,
        "findings": health_results["findings"],
        "by_category": dict(by_category),
        "pharmgkb_findings": health_results["pharmgkb_findings"],
        "disease": {
            "affected": affected,
            "carriers": carriers,
            "het_unknown": het_unknown,
            "risk_factor": disease_findings.get("risk_factor", []) if disease_findings else [],
            "drug_response": disease_findings.get("drug_response", []) if disease_findings else [],
            "protective": disease_findings.get("protective", []) if disease_findings else [],
            "stats": disease_stats,
        },
        "protocol": {
            "supplements": supplements,
            "diet": diet_recs,
            "lifestyle": lifestyle_recs,
            "monitoring": monitoring,
        },
    }


def _build_supplements(fd: dict) -> list:
    supps = []

    if "MTHFR" in fd and fd["MTHFR"]["magnitude"] >= 2:
        supps.append({"name": "Methylfolate (L-5-MTHF)", "dose": "400-800mcg daily", "reason": "MTHFR variant reduces folic acid conversion", "gene": "MTHFR"})
        supps.append({"name": "Methylcobalamin (B12)", "dose": "1000mcg sublingual", "reason": "Supports methylation cycle", "gene": "MTHFR"})

    if "MTRR" in fd and fd["MTRR"]["magnitude"] >= 2:
        if not any("B12" in s["name"] for s in supps):
            supps.append({"name": "Methylcobalamin (B12)", "dose": "1000-5000mcg sublingual", "reason": "MTRR variant impairs B12 recycling", "gene": "MTRR"})

    if "GC" in fd and fd["GC"].get("status") == "low":
        supps.append({"name": "Vitamin D3", "dose": "2000-5000 IU daily", "reason": "Genetically low vitamin D binding protein", "gene": "GC"})
        supps.append({"name": "Vitamin K2 (MK-7)", "dose": "100-200mcg daily", "reason": "Synergistic with D3 for calcium metabolism", "gene": "GC"})

    if "FADS1" in fd and fd["FADS1"].get("status") == "low_conversion":
        supps.append({"name": "Fish Oil / Algae Oil (EPA/DHA)", "dose": "1-2g EPA+DHA daily", "reason": "Poor conversion from plant omega-3s", "gene": "FADS1"})

    if "COMT" in fd and fd["COMT"].get("status") == "slow":
        supps.append({"name": "Magnesium Glycinate", "dose": "300-400mg evening", "reason": "Supports COMT function, calming effect", "gene": "COMT"})

    if "PEMT" in fd:
        supps.append({"name": "Choline (CDP-Choline)", "dose": "250-500mg daily", "reason": "PEMT variant increases dietary choline requirement", "gene": "PEMT"})

    if "IL6" in fd and fd["IL6"].get("status") == "high":
        supps.append({"name": "Omega-3 (EPA/DHA)", "dose": "2-3g daily", "reason": "Higher baseline inflammation (IL-6)", "gene": "IL6"})

    return supps


def _build_diet_recs(fd: dict) -> list:
    recs = []
    if "APOA2" in fd and fd["APOA2"].get("status") == "sensitive":
        recs.append({"title": "Limit Saturated Fat", "detail": "APOA2 variant links sat fat intake to weight gain. Keep <7% calories from saturated fat.", "gene": "APOA2"})
    if "MTHFR" in fd and fd["MTHFR"]["magnitude"] >= 2:
        recs.append({"title": "Emphasize Folate-Rich Foods", "detail": "Leafy greens, legumes, liver. Avoid folic acid-fortified processed foods.", "gene": "MTHFR"})
    if "IL6" in fd:
        recs.append({"title": "Anti-Inflammatory Diet", "detail": "Omega-3 rich fish, colorful vegetables, minimize processed foods.", "gene": "IL6"})
    if "MCM6/LCT" in fd and "intolerant" in fd["MCM6/LCT"].get("status", ""):
        recs.append({"title": "Lactose Intolerance", "detail": "May tolerate fermented dairy. Ensure calcium from other sources.", "gene": "MCM6/LCT"})
    if "HLA-DQA1" in fd:
        recs.append({"title": "Celiac Risk (HLA-DQ2.5)", "detail": "No preventive gluten-free diet needed. Test if GI symptoms arise.", "gene": "HLA-DQA1"})

    caffeine_issues = []
    if "CYP1A2" in fd and fd["CYP1A2"].get("status") in ["slow", "intermediate"]:
        caffeine_issues.append("slow metabolizer")
    if "ADORA2A" in fd and fd["ADORA2A"].get("status") == "anxiety_prone":
        caffeine_issues.append("anxiety-prone")
    if "COMT" in fd and fd["COMT"].get("status") == "slow":
        caffeine_issues.append("slow COMT")
    if caffeine_issues:
        recs.append({"title": "Caffeine Caution", "detail": f"Limit to morning only ({', '.join(caffeine_issues)}). Consider lower doses or green tea.", "gene": "CYP1A2/COMT"})

    if "HFE" in fd:
        recs.append({"title": "Iron Awareness (HFE)", "detail": "Don't supplement iron unless deficiency confirmed. Blood donation helps if ferritin high.", "gene": "HFE"})
    return recs


def _build_lifestyle_recs(fd: dict) -> list:
    recs = []
    if "COMT" in fd and fd["COMT"].get("status") == "slow":
        recs.append({"title": "Stress Management Critical", "detail": "Slow COMT means catecholamines build up under stress. Daily meditation, breathwork, adequate sleep.", "gene": "COMT"})
    if "BDNF" in fd and fd["BDNF"]["magnitude"] >= 2:
        recs.append({"title": "Exercise Is Essential", "detail": "BDNF variant reduces brain growth factor. Physical activity is one of the strongest natural BDNF boosters.", "gene": "BDNF"})
    if "ACTN3" in fd:
        status = fd["ACTN3"].get("status", "")
        label = {"endurance": "Endurance", "power": "Power", "mixed": "Mixed"}.get(status, "Mixed")
        recs.append({"title": f"Training Style ({label})", "detail": f"ACTN3 {status} type - tailor exercise accordingly.", "gene": "ACTN3"})
    if "ARNTL" in fd:
        recs.append({"title": "Circadian Rhythm Support", "detail": "May have weaker internal clock. Strong morning light, consistent sleep/wake times.", "gene": "ARNTL"})

    bp_genes = ["AGTR1", "ACE", "AGT", "GNB3"]
    bp_count = sum(1 for g in bp_genes if g in fd)
    if bp_count >= 2:
        recs.append({"title": "Blood Pressure Focus", "detail": "Multiple BP-related variants. Regular monitoring, sodium restriction, 150+ min/week aerobic exercise.", "gene": "Multiple"})
    if "MC1R" in fd:
        recs.append({"title": "Sun Protection (MC1R)", "detail": "Skin aging variant. Daily SPF 30+, avoid excessive sun.", "gene": "MC1R"})
    return recs


def _build_monitoring(fd: dict, disease_findings: dict | None) -> list:
    items = []
    if "MTHFR" in fd and fd["MTHFR"]["magnitude"] >= 2:
        items.append({"test": "Homocysteine", "frequency": "Annually", "target": "<10 \u03bcmol/L", "reason": "MTHFR variant"})
    if "MTRR" in fd and fd["MTRR"]["magnitude"] >= 2:
        items.append({"test": "B12 + MMA", "frequency": "Annually", "target": "Functional B12 status", "reason": "MTRR variant"})
    if "GC" in fd:
        items.append({"test": "25-OH Vitamin D", "frequency": "Annually", "target": "40-60 ng/mL", "reason": "GC variant"})
    if any(g in fd for g in ["AGTR1", "ACE", "AGT", "GNB3"]):
        items.append({"test": "Blood Pressure", "frequency": "Regular home monitoring", "target": "<130/80", "reason": "Multiple BP variants"})
    if "HFE" in fd:
        items.append({"test": "Ferritin / Iron Panel", "frequency": "Every 1-2 years", "target": "Normal range", "reason": "HFE carrier"})
    if "TCF7L2" in fd and fd["TCF7L2"]["magnitude"] >= 2:
        items.append({"test": "Fasting Glucose / HbA1c", "frequency": "Annually", "target": "<5.7% HbA1c", "reason": "TCF7L2 diabetes risk"})
    return items


def run_analysis_async(job_id: str, genome_path: Path, subject_name: str | None):
    def _worker():
        j = jobs[job_id]
        try:
            j["status"] = "running"

            _set_step(job_id, STEPS[0], 10)
            genome_by_rsid, genome_by_position = load_genome(genome_path)

            _set_step(job_id, STEPS[1], 25)
            pharmgkb = load_pharmgkb()

            _set_step(job_id, STEPS[2], 45)
            health_results = analyze_lifestyle_health(genome_by_rsid, pharmgkb)

            _set_step(job_id, STEPS[3], 70)
            disease_findings, disease_stats = load_clinvar_and_analyze(genome_by_position)

            _set_step(job_id, STEPS[4], 90)
            results = _build_structured_results(
                health_results, disease_findings, disease_stats, len(genome_by_rsid)
            )

            j["steps_completed"].append(STEPS[4])
            j["results"] = results
            j["status"] = "complete"
            j["progress"] = 100
            j["step"] = "Complete"

        except Exception as e:
            j["status"] = "error"
            j["error"] = str(e)
            j["step"] = "Error"

    thread = threading.Thread(target=_worker, daemon=True)
    thread.start()
