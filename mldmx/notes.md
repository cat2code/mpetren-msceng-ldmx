# Partitioning code:

## Moving stuff out from train_ecal_tpad_mlpf_lite_scaled.py

* Simple progress class needs to have its own place outside of script
    * make_progress function as well as it is connected to this

* Code related to logging should also not be contained in this script it should have its own place

* resolve_run_dir can be moved out as well I like this solution so it can be global standard for other scripts

* Same goes for resolve_data_dir

* Same goes for deterministic_split it can be global standard for making training splits

* Same goes for normalize_continuous_features the normalization is a preprocessing 

* Same goes for count_classes it can be global standard of counting the number of classes 


# Input data to model
## Truth info
### ECal:
x, y, z, origin ID, rec energy, is noise

* Idea: Add layer index info

* Idea: Add time info (does that exist?)

* Idea event-level info: pre-calculate total rec energy, if that improves anything...

### Trigger Scintillator:
centroid, pe

## Detected info
### ECal:
x, y, z, rec energy

### Trigger Scintillator:
centroid, pe

# Further improvements

## Critical!

* I need to make reading root and training way faster it is slow right now. I can also evaluate if GPU acceleration can be improved

## Various

* How to introduce inductive bias to make 100% predictions on classes as the naive choice? Right now it guesses fractions in almost every case and very rarily makes a 100% prediction even though these are the most common. 
    * Fixing this will make the fraction prediction an actually viable thing

* Event-level number of electrons prediction
    * How do we combine this into the model? How do we do an event interpretation and hit-level predictions and does one of them come before the opther or what? 


# Ongoing conversations

* https://chatgpt.com/g/g-p-691ef59786788191a75bc490283719f0-ldmx-software-assistant/c/69a58150-5424-8393-a2ce-ef5b205dc08c

* https://chatgpt.com/g/g-p-69faff0c00048191b60dc8210dd6cc2a-master-thesis-writing/c/6a0b7cf8-701c-8384-af15-47261c4f9e59



# Trying to make a slice here

ROOT -> awkward arrays -> padded tensor -> tiny NN forward pass

see smoke test in root_to_tensor_smoke.py

