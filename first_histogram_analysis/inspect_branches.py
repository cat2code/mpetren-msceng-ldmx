import uproot

with uproot.open("hits_only.root") as f:
    print("Keys at top level:", f.keys())
    obj = f["LDMX_Events"]
    print("Class of LDMX_Events:", type(obj))

    if isinstance(obj, uproot.TTree):
        tree = obj
        print("Number of entries:", tree.num_entries)
        print("Branch names:", tree.keys())
    else:
        print("LDMX_Events is not a TTree")
