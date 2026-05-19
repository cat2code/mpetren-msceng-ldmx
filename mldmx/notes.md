# Input data to model
## Truth info
### ECal:
x, y, z, origin ID, rec energy, is noise

* Idea: Add layer index info

* Idea: Add time info (does that exist?)

### Trigger Scintillator:
centroid, pe

## Detected info
### ECal:
x, y, z, rec energy

### Trigger Scintillator:
centroid, pe



### Ongoing conversations

https://chatgpt.com/g/g-p-691ef59786788191a75bc490283719f0-ldmx-software-assistant/c/69a58150-5424-8393-a2ce-ef5b205dc08c


#### Trying to make a slice here

ROOT -> awkward arrays -> padded tensor -> tiny NN forward pass

see smoke test in root_to_tensor_smoke.py

