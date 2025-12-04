# inspect_branches.py
import uproot

with uproot.open("output.root") as f:
    print("Keys at top level:", f.keys())

    tree = f["LDMX_Events"]
    print("\nBranches / fields in LDMX_Events:")
    for k in tree.keys():
        print("  ", k)
