pragma circom 2.0.0;

include "node_modules/circomlib/circuits/comparators.circom";
include "node_modules/circomlib/circuits/poseidon.circom";

template GameStats() {
    // Public inputs
    signal input gameId;
    signal input timestamp;
    
    // Private inputs (actual stats)
    signal input kills;
    signal input deaths;
    signal input assists;
    signal input score;
    
    // Public outputs (what we reveal)
    signal output statsHash;
    signal output validScore; // boolean
    
    // Compute hash of stats for privacy
    component hasher = Poseidon(4);
    hasher.inputs[0] <== kills;
    hasher.inputs[1] <== deaths;
    hasher.inputs[2] <== assists;
    hasher.inputs[3] <== score;
    
    statsHash <== hasher.out;
    
    // Verify score is above minimum threshold
    component scoreCheck = GreaterEqualThan(32);
    scoreCheck.in[0] <== score;
    scoreCheck.in[1] <== 100; // minimum score threshold
    validScore <== scoreCheck.out;
}

component main = GameStats();