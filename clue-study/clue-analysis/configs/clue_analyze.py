import argparse
from LDMX.Framework import ldmxcfg

parser = argparse.ArgumentParser()
parser.add_argument("--input", required=True)
parser.add_argument("--out", default="clue_out.root")
parser.add_argument("--hist", default="clue_hists.root")
parser.add_argument("--maxEvents", type=int, default=-1)
parser.add_argument("--nelectrons", type=int, default=1)
args = parser.parse_args()

p = ldmxcfg.Process("clueAna")
p.inputFiles = [args.input]
p.outputFiles = [args.out]
p.histogramFile = args.hist
p.maxEvents = args.maxEvents
p.logFrequency = 100
p.termLogLevel = 1

# Geometry + conditions (keep)
import LDMX.Ecal.EcalGeometry
import LDMX.Ecal.ecal_hardcoded_conditions
import LDMX.Hcal.HcalGeometry
import LDMX.Hcal.hcal_hardcoded_conditions

# CLUE cluster producer (official python config)
import LDMX.Ecal.ecalClusters as cl
cluster = cl.EcalClusterProducer()
# If needed later: cluster.rec_hit_pass_name = "<PASSNAME>"

# DQM analyzer that is known to work in the repo example
from LDMX.DQM import dqm
ecalClusterAna = dqm.EcalClusterAnalyzer()
# If it has a parameter for expected N electrons, set it here if available:
# ecalClusterAna.nElectrons = args.nelectrons  (only if this exists in your build)

p.sequence = [
    cluster,
    ecalClusterAna,
]
