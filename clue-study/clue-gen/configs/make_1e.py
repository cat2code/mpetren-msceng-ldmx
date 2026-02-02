'''
One 8 GeV electron per event (upstream tagger).
Propagate through LDMX detector geometry (with scoring planes).
Run ECal/HCal digitization and basic reconstruction.
Write reco-level collections to a ROOT file.

Physics context:
Fixed-target electron-beam missing-momentum experiment (LDMX).

fire make_1e.py --nevents 100 --out 1e_test.root
'''


from LDMX.Framework import ldmxcfg # contains producer and analyzer objects
import argparse

# Functionality to pass arguments in command line + set default arguments
parser = argparse.ArgumentParser()
parser.add_argument("--nevents", type=int, default=1000)
parser.add_argument("--out", default="1e.root")
parser.add_argument("--det", default="ldmx-det-v14-8gev")
parser.add_argument("--run", type=int, default=9001)
args = parser.parse_args()

# Define process
p = ldmxcfg.Process("sim1e") # create producer object and simply set a reasonable name

# Process runs according to arguments
p.run = args.run
p.maxEvents = args.nevents
p.outputFiles = [args.out]
p.logFrequency = 100 # ! outside of argparse
p.termLogLevel = 1 # ! outside of argparse

from LDMX.SimCore import simulator, generators # config simulation, and generators ready to use
sim = simulator.simulator("sim") # create sim object (inherit from process object) and simply set a reasonable name
sim.setDetector(args.det, True) # True: include scoring planes
sim.generators = [generators.single_8gev_e_upstream_tagger()] # fire 8GeV electron beam at target coordinate [0,0,0]

# Geometry + conditions
import LDMX.Ecal.EcalGeometry # wonky import that actually inserts ECal-geometry at this import line
import LDMX.Ecal.ecal_hardcoded_conditions
import LDMX.Hcal.HcalGeometry
import LDMX.Hcal.hcal_hardcoded_conditions

# ECal rec
import LDMX.Ecal.digi as ecal_digi
import LDMX.Hcal.digi as hcal_digi

p.sequence = [
    sim,
    ecal_digi.EcalDigiProducer(),
    ecal_digi.EcalRecProducer(),
    hcal_digi.HcalDigiProducer(),
    hcal_digi.HcalRecProducer(),
    # cluestuff here
]
