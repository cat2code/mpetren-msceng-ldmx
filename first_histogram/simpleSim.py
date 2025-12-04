#simpleSim.py

# need the configuration python module
from LDMX.Framework import ldmxcfg

# Create the necessary process object (call this pass "sim")
p = ldmxcfg.Process( "sim" )

# Set the unique number that identifies this run
p.run = 9001 
# import a template simulator and change some of its parameters
from LDMX.SimCore import generators
from LDMX.SimCore import simulator

mySim = simulator.simulator( "mySim" )
mySim.setDetector( 'ldmx-det-v12' )
mySim.generators = [ generators.single_4gev_e_upstream_tagger() ]
mySim.description = 'I am a basic working example!'

# import chip/geometry conditions
import LDMX.Ecal.ecal_hardcoded_conditions
import LDMX.Hcal.HcalGeometry
import LDMX.Hcal.hcal_hardcoded_conditions
# import processor templates
import LDMX.Ecal.digi as ecal_digi
import LDMX.Hcal.digi as hcal_digi
# add them to the sequence
p.sequence = [
    mySim,
    ecal_digi.EcalDigiProducer(),
    ecal_digi.EcalRecProducer(),
    hcal_digi.HcalDigiProducer(),
    hcal_digi.HcalRecProducer()
    ]

# During production (simulation), maxEvents is used as the number
# of events to simulate.
# Other times (like when analyzing a file), maxEvents is used as
# a cutoff to prevent fire from running over the entire file.
p.maxEvents = 10

# how frequently should the process print messages to the screen?
p.logFrequency = 1

# I want to see all of the information messages (the default is only warnings and errors)
p.termLogLevel = 1

# give name of output file
p.outputFiles = [ "output.root" ]

# print process object to make sure configuration is correct
# at beginning of run and wait for user to press enter to start
p.pause()
