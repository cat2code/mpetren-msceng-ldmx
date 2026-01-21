import argparse
from LDMX.Framework import ldmxcfg

parser = argparse.ArgumentParser()
parser.add_argument("--input", required=True)
parser.add_argument("--out", default="reco_clue.root")
parser.add_argument("--hist", default="clue_hists.root")
parser.add_argument("--maxEvents", type=int, default=-1)
parser.add_argument("--nelectrons", type=int, default=1)
parser.add_argument("--useCLUE", action="store_true")
parser.add_argument("--rhoc", type=float, default=550.0)
parser.add_argument("--deltac", type=float, default=10.0)
parser.add_argument("--deltao", type=float, default=40.0)
parser.add_argument("--skipReco", action="store_true")
args = parser.parse_args()

p = ldmxcfg.Process("clueAna")
p.inputFiles = [args.input]
p.outputFiles = [args.out]
p.histogramFile = args.hist
p.maxEvents = args.maxEvents
p.logFrequency = 100
p.termLogLevel = 1


# Geometry + conditions (brukar behövas)
import LDMX.Ecal.EcalGeometry
import LDMX.Ecal.ecal_hardcoded_conditions
import LDMX.Hcal.HcalGeometry
import LDMX.Hcal.hcal_hardcoded_conditions

seq = []
if not args.skipReco:
    import LDMX.Ecal.digi as ecal_digi
    import LDMX.Hcal.digi as hcal_digi
    seq += [
        ecal_digi.EcalDigiProducer(),
        ecal_digi.EcalRecProducer(),
        hcal_digi.HcalDigiProducer(),
        hcal_digi.HcalRecProducer(),
    ]

# Skapa moduler direkt (undvik python-wrappern som crashar)
cluster_prod = ldmxcfg.Producer("ecalClusters", "ecal::EcalClusterProducer", "Ecal")
cluster_ana  = ldmxcfg.Analyzer ("ecalClusterAna", "ecal::EcalClusterAnalyzer", "Ecal")


# --- Set parameters via attribute assignment (this build has no .parameters) ---

def try_set(mod, names, value):
    for n in names:
        try:
            setattr(mod, n, value)
            return True
        except Exception:
            pass
    return False


# Producer parameters
if args.useCLUE:
    try_set(cluster_prod, ["CLUE", "useCLUE", "clue"], True)

try_set(cluster_prod, ["rhoC", "rhoc", "rho_c"], args.rhoc)
try_set(cluster_prod, ["deltaC", "deltac", "delta_c"], args.deltac)
try_set(cluster_prod, ["deltaO", "deltao", "delta_o"], args.deltao)

# Analyzer parameters
try_set(cluster_ana, ["nbrOfElectrons", "nElectrons", "nelectrons"], args.nelectrons)


# Analyzer parameters
try_set(cluster_ana, ["nbrOfElectrons", "nElectrons", "nelectrons"], args.nelectrons)


seq += [cluster_prod, cluster_ana]
p.sequence = seq