import uproot
import awkward as ak
import hist
import matplotlib.pyplot as plt
import mplhep

plt.style.use(mplhep.style.ROOT)

with uproot.open("hits_only.root") as f:
    tree = f["LDMX_Events"]
    events = tree.arrays()

print("Fields in events:", events.fields)

# Use ECal SimHit energy deposit (MeV) branch
ECAL_KEY = "EcalSimHits_sim.edep_"

# Sum deposited energy over all ECal hits per event
total_ecal_energy = ak.sum(events[ECAL_KEY], axis=1)

# Convert MeV -> GeV
total_ecal_energy_GeV = total_ecal_energy / 1000.0

h = (
    hist.Hist
    .new.Reg(160, 0, 16, label="Total ECal SimHit Energy [GeV]")
    .Double()
)
h.fill(total_ecal_energy_GeV)

fig, ax = plt.subplots()
h.plot1d(ax=ax)
ax.set_xlabel("Total ECal SimHit Energy [GeV]")
ax.set_ylabel("Events")
fig.tight_layout()
fig.savefig("ecal_total_energy_simhits.png")
print("Saved histogram to ecal_total_energy_simhits.png")
