// A simple, raw Merkle Tree and Proof implementation.
// This requires Node.js for the 'crypto' module.

// A helper function to compute a SHA-256 hash
const fs = require('fs')
const path = require('path')
const crypto = require('crypto');
function sha256(data) {
    // console.log('===========', data)
    // throw new Error('ok')
    return crypto.createHash('sha256').update(data).digest('hex');
}

// --------------------------------------------------
// --- Merkle Tree Construction and Root Creation ---
// --------------------------------------------------

/**
 * Builds a Merkle tree from a list of transactions (data).
 * @param {string[]} transactions The list of data strings.
 * @returns {{merkleTree: string[][], merkleRoot: string}} The tree structure and its root hash.
 */
function buildMerkleTree(transactions) {
    if (transactions.length === 0) {
        return { merkleTree: [], merkleRoot: null };
    }

    // Hash each transaction to create the leaf nodes
    // let leaves = transactions.map(tx => sha256(tx));


    let leaves = transactions.map(block => ({
        hash: sha256(block),
        data: block
    }))

    // The Merkle tree is an array of arrays, representing each level
    const merkleTree = [leaves];

    // Build the tree level by level until we have a single root hash
    while (leaves.length > 1) {
        const nextLevel = [];

        // Combine pairs of hashes from the current level
        for (let i = 0; i < leaves.length; i += 2) {
            const left = leaves[i];
            const right = leaves[i + 1] || leaves[i]// Handle odd number of leaves by duplicating the last one

            // Hash the concatenation of the two child hashes
            const parentHash = sha256(left.hash + right.hash);
            nextLevel.push({hash: parentHash, left, right});
        }
        leaves = nextLevel;
        merkleTree.push(leaves);
    }

    const merkleRoot = leaves[0];
    return { merkleTree, merkleRoot };
}

// ------------------------------------------
// --- Merkle Proof Generation and Verification ---
// ------------------------------------------

/**
 * Generates a Merkle proof for a specific transaction.
 * @param {string} targetTransaction The transaction string to prove.
 * @param {string[]} transactions The full list of transactions from the block.
 * @param {string[][]} merkleTree The pre-built Merkle tree structure.
 * @returns {string[]} The list of hashes needed for the proof.
 */
function getMerkleProof(targetTransaction, transactions, merkleTree) {
    const proof = [];
    let currentHash = sha256(targetTransaction);
    let currentIndex = transactions.indexOf(targetTransaction);

    if (currentIndex === -1) {
        return null; // Transaction not found
    }

    // Traverse the tree from the leaf up to the root
    for (let level = 0; level < merkleTree.length - 1; level++) {
        const currentLevel = merkleTree[level];
        const siblingIndex = (currentIndex % 2 === 0) ? currentIndex + 1 : currentIndex - 1;

        // Check if the sibling exists (for the last leaf in an odd-sized tree)
        if (siblingIndex < currentLevel.length) {
            proof.push(currentLevel[siblingIndex]);
        } else {
            // If no sibling, it means we're at the duplicated leaf, so push the leaf itself
            proof.push(currentLevel[currentIndex]);
        }

        currentIndex = Math.floor(currentIndex / 2); // Move up to the parent's index
    }

    return proof;
}

/**
 * Verifies a Merkle proof against a Merkle root.
 * @param {string} targetTransaction The original transaction to verify.
 * @param {string[]} proof The Merkle proof array of hashes.
 * @param {string} merkleRoot The known Merkle root of the block.
 * @returns {boolean} True if the proof is valid, false otherwise.
 */
function verifyMerkleProof(targetTransaction, proof, merkleRoot) {
    let computedHash = sha256(targetTransaction);

    // Traverse the proof hashes, combining them with the computed hash
    for (const siblingHash of proof) {
        const combinedHash = (computedHash < siblingHash) ? computedHash + siblingHash : siblingHash + computedHash;
        computedHash = sha256(combinedHash);
    }

    // The final computed hash should match the known Merkle root
    return computedHash === merkleRoot;
}

// -----------------------------------
// --- Example Usage ---
// -----------------------------------

const transactions = ['tx A', 'tx B', 'tx C', 'tx D', 'tx E'];

// 1. Build the Merkle tree and get the root
const { merkleTree, merkleRoot } = buildMerkleTree(transactions);

// console.log(merkleRoot, merkleTree);

console.log(merkleTree)


// console.log('Original Transactions:', transactions);
// console.log('\nGenerated Merkle Tree (level by level):');
// merkleTree.forEach((level, i) => console.log(`Level ${i}: ${level}`));
// console.log('\nMerkle Root:', merkleRoot);
//
// // 2. Choose a transaction to prove
// const transactionToProve = 'tx C';
//
// // 3. Generate the proof for that transaction
// const proof = getMerkleProof(transactionToProve, transactions, merkleTree);
// console.log(`\nProof for "${transactionToProve}":`, proof);
//
// // 4. Verify the proof
// const isValid = verifyMerkleProof(transactionToProve, proof, merkleRoot);
// console.log(`\nIs "${transactionToProve}" a part of the tree?`, isValid);
//
// // 5. Try to verify a non-existent transaction (should be false)
// const nonExistentTx = 'tx Z';
// const invalidProof = getMerkleProof(nonExistentTx, transactions, merkleTree); // This will be null, but we'll try to verify it
// const isInvalid = verifyMerkleProof(nonExistentTx, [], merkleRoot); // We pass an empty proof since none exists
// console.log(`\nIs "${nonExistentTx}" a part of the tree?`, isInvalid);



const json = JSON.stringify(merkleRoot, null,  2);

fs.writeFileSync('merkleRoot.json', json);