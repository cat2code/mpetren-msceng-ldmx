'''
This is the configuration script (LDMX-SW) that was used to create the individual non-signal electrons by 
Hans Alin in a huge dataset. LDMX-SW is a framework based on Geant4 and it is written with C++ and python.

Afterwards I had another configuration script with LDMX-SW that made overlays where 2 electron and
3 electron events where created in two new dataset series with unique electron in every overlay event, 
thanks to Hans had made more than enough simulated singular electrons to make sure of this. 
'''

from LDMX.Framework import ldmxcfg
import argparse

p = ldmxcfg.Process('test')

from LDMX.SimCore import simulator as sim

parser = argparse.ArgumentParser()
parser.add_argument('--run-number', type=int, default=42)
parser.add_argument('--num-events', type=int, default=25)
parser.add_argument('--batch-number', type=int, required=True)
args = parser.parse_args()

#### Detector ######
my_sim = sim.Simulator(instance_name="my_sim")
det = 'ldmx-det-v15-8gev'
# Options for the detector:
# if include_scoring_planes_minimal = True additional scoring planes is
# added to the detetctor (not part of the detector hits)
# and if include_scoring_planes_others = True, additional scoring planes are added
# default values are that both are false.

my_sim.set_detector(det, include_scoring_planes_minimal = True )
from LDMX.SimCore import generators as gen


my_sim.generators.append( gen.single_8gev_e_upstream_tagger() )
my_sim.description = 'Basic test Simulation'

p.sequence = [ my_sim ]

##################################################################
# Below should be the same for all sim scenarios

import os
import sys


p.run = int(args.run_number)
p.max_events = int(args.num_events)
batch_string = str(args.batch_number)
p.histogram_file = f'data/hist_{batch_string}.root'
p.output_files = [f'data/events_{batch_string}.root']

# Load the full tracking sequence
import LDMX.Ecal.digi as ecal_digi
import LDMX.Ecal.ecal_clusters as ecal_cluster

# Load the ECAL modules
import LDMX.Ecal.ecal_geometry
import LDMX.Ecal.ecal_hardcoded_conditions
import LDMX.Ecal.vetos as ecal_vetos
import LDMX.Hcal.digi as hcal_digi_and_reco

# Load the HCAL modules
import LDMX.Hcal.hcal_geometry
import LDMX.Hcal.hcal_hardcoded_conditions
from LDMX.Tracking import full_tracking_sequence


hcal_digi = hcal_digi_and_reco.HcalDigiProducer()
hcal_reco = hcal_digi_and_reco.HcalRecProducer()

# Load the TS modules
from LDMX.TrigScint.trig_scint import (
        TrigScintClusterProducer,
        TrigScintDigiProducer,
        trig_scint_track,
        TrigScintQIEDigiProducer
)


ts_digis = [
        TrigScintDigiProducer.pad1(),
        TrigScintDigiProducer.pad2(),
        TrigScintDigiProducer.pad3(),
        ]

ts_clusters = [
        TrigScintClusterProducer.pad1(),
        TrigScintClusterProducer.pad2(),
        TrigScintClusterProducer.pad3(),
        ]
# Adding adc values
ts_qie = [
        TrigScintQIEDigiProducer.pad1(),
        TrigScintQIEDigiProducer.pad2(),
        TrigScintQIEDigiProducer.pad3()
]

# Load the DQM modules
from LDMX.DQM import dqm

# Load electron counting and trigger
from LDMX.Recon.electron_counter import ElectronCounter
from LDMX.Recon.simple_trigger import TriggerProcessor


count = ElectronCounter(
    simulated_electron_number=1,
    instance_name="ElectronCounter",
    input_pass_name="",
)

# Load ecal veto and use tracking in it
ecal_veto = ecal_vetos.EcalVetoProcessor()
ecal_mip = ecal_vetos.EcalMipProcessor()
ecal_veto_pnet = ecal_vetos.EcalPnetVetoProcessor()

# Load HCAL veto
import LDMX.Hcal.hcal as hcal


hcal_veto = hcal.HcalVetoProcessor()

# Load preselection skimmer
from LDMX.Recon.ecal_preselection_skimmer import EcalPreselectionSkimmer


# ecal_pres_skimmer = EcalPreselectionSkimmer()

# p.logger.term_level = 1
# p.logger.custom(ecal_veto, level = -1)

# # Add full tracking for both tagger and recoil trackers:
# # digi, seeds, CFK, ambiguity resolution, GSF, DQM
# p.sequence.extend(full_tracking_sequence.sequence)
# p.sequence.extend(full_tracking_sequence.dqm_sequence)

# p.sequence.extend([
#         ecal_digi.EcalDigiProducer(),
#         ecal_digi.EcalRecProducer(),
#         ecal_pres_skimmer,
#         ecal_cluster.EcalClusterProducer(),
#         ecal_veto,
#         ecal_mip,
#         ecal_veto_pnet,
#         hcal_digi,
#         hcal_reco,
#         hcal_veto,
#         *ts_digis,
#         *ts_clusters,
#         *ts_qie,
#         trig_scint_track,
#         count, TriggerProcessor('trigger', 8000.),
#         dqm.PhotoNuclearDQM(),
#         dqm.EcalClusterAnalyzer()
#         ])

# p.sequence.extend(dqm.all_dqm)