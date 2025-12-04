from LDMX.Framework import ldmxcfg
from LDMX.SimCore import simulator, generators

p = ldmxcfg.Process("sim")
p.run = 9002

mySim = simulator.simulator("mySim")
mySim.setDetector("ldmx-det-v12")
mySim.generators = [generators.single_4gev_e_upstream_tagger()]
mySim.description = "4 GeV e- gun, hits only"

# Conditions: this is what fixes the EcalGeometry error
import LDMX.Ecal.EcalGeometry          # <-- add this
import LDMX.Ecal.ecal_hardcoded_conditions
import LDMX.Hcal.HcalGeometry
import LDMX.Hcal.hcal_hardcoded_conditions

p.sequence = [mySim]

p.maxEvents = 100
p.logFrequency = 10
p.termLogLevel = 1
p.outputFiles = ["hits_only.root"]
