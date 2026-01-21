import argparse
from LDMX.Framework import ldmxcfg

parser = argparse.ArgumentParser()
parser.add_argument("--nevents", type=int, default=1000)
parser.add_argument("--out", default="1e.root")
parser.add_argument("--det", default="ldmx-det-v14-8gev")
parser.add_argument("--run", type=int, default=9001)
args = parser.parse_args()

p = ldmxcfg.Process("sim1e")
p.run = args.run
p.maxEvents = args.nevents
p.outputFiles = [args.out]
p.logFrequency = 100
p.termLogLevel = 1

from LDMX.SimCore import simulator, generators
sim = simulator.simulator("sim")
sim.setDetector(args.det, True)
sim.generators = [generators.single_8gev_e_upstream_tagger()]

# Geometry + conditions
import LDMX.Ecal.EcalGeometry
import LDMX.Ecal.ecal_hardcoded_conditions
import LDMX.Hcal.HcalGeometry
import LDMX.Hcal.hcal_hardcoded_conditions

# ECal reco
import LDMX.Ecal.digi as ecal_digi
import LDMX.Hcal.digi as hcal_digi

p.sequence = [
    sim,
    ecal_digi.EcalDigiProducer(),
    ecal_digi.EcalRecProducer(),
    hcal_digi.HcalDigiProducer(),
    hcal_digi.HcalRecProducer(),
]

# p.pause()
