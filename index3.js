// A simple, raw Merkle Tree and Proof implementation.
// This requires Node.js for the 'crypto' module.

const crypto = require('crypto');
function sha256(data) {
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

    let leaves = transactions.map(tx => sha256(tx));
    const merkleTree = [leaves];

    while (leaves.length > 1) {
        const nextLevel = [];
        for (let i = 0; i < leaves.length; i += 2) {
            const left = leaves[i];
            const right = (i + 1 < leaves.length) ? leaves[i + 1] : left;

            // CORRECTION: Combine hashes in a consistent, sorted order
            const combinedHashes = [left, right].sort().join('');
            const parentHash = sha256(combinedHashes);
            nextLevel.push(parentHash);
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
    let currentIndex = transactions.indexOf(targetTransaction);
    if (currentIndex === -1) {
        return null;
    }
    for (let level = 0; level < merkleTree.length - 1; level++) {
        const currentLevel = merkleTree[level];
        const siblingIndex = (currentIndex % 2 === 0) ? currentIndex + 1 : currentIndex - 1;
        if (siblingIndex < currentLevel.length) {
            proof.push(currentLevel[siblingIndex]);
        } else {
            proof.push(currentLevel[currentIndex]);
        }
        currentIndex = Math.floor(currentIndex / 2);
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

    for (const siblingHash of proof) {
        // CORRECTION: Combine hashes in a consistent, sorted order
        const combinedHashes = [computedHash, siblingHash].sort().join('');
        computedHash = sha256(combinedHashes);
    }

    return computedHash === merkleRoot;
}

function verifyMerkleProofHash(findHash, proof, merkleRoot) {
    let computedHash = findHash;

    const updatedHash = proof.map(pr=>pr.hash);

    console.log(updatedHash);
    // let computedHash = ''
    for (const siblingHash of updatedHash) {
        // CORRECTION: Combine hashes in a consistent, sorted order
        const combinedHashes = [computedHash, siblingHash].sort().join('');
        computedHash = sha256(combinedHashes);
    }
    // console.log(computedHash);

    return computedHash === merkleRoot;
}

// -----------------------------------
// --- Example Usage ---
// -----------------------------------

const transactions = ['tx A', 'tx B', 'tx C', 'tx D', 'tx E'];

const { merkleTree, merkleRoot } = buildMerkleTree(transactions);

console.log('Original Transactions:', transactions);
console.log('\nMerkle Root:', merkleRoot);
console.log('merkleTree:', merkleTree);
//
const transactionToProve = 'tx C';
//
const proof = getMerkleProof(transactionToProve, transactions, merkleTree);
console.log(`\nProof for "${transactionToProve}":`, proof);
//
// const isValid = verifyMerkleProof(transactionToProve, proof, merkleRoot);
// console.log(`\nIs "${transactionToProve}" a part of the tree?`, isValid);
//
// const nonExistentTx = 'tx Z';
// const isInvalid = verifyMerkleProof(nonExistentTx, [], merkleRoot);
// console.log(`\nIs "${nonExistentTx}" a part of the tree?`, isInvalid);




// const mroot = 'd9e373ca7462868bc64ecefe14a2c13c954158981773f901702cd3351f2ba57a'
// const mproof =  [
//     {
//         hash: '0x7dff748603fdeba8b761df81c372390c4fc4a6006e1c74933b81bd54dd904073',
//         direction: 'left'
//     },
//     {
//         hash: '0x0624dc85cea85575ed94a290b5c3b3a0caa8a1c2e888c287f0689d4e4f4d4ba5',
//         direction: 'right'
//     },
//     {
//         hash: 'c623904a923b8d31ff1fd80311553dc35978d64d7b55d9095f1bc57e788e36bf',
//         direction: 'right'
//     },
//     {
//         hash: 'fdaeb371ce597102fea90f6a2d3044132fd87566b48eccbf5dcb48c9a5994214',
//         direction: 'left'
//     },
//     {
//         hash: '1fa1425ab0b2d77add1942ecfb7c0e8bd98870f6d799d001a959066bb410fd13',
//         direction: 'right'
//     }
// ]

const mroot = '7451558405e2068ec4ea5142435806a487753a3c47e29dad8d18dc7f51af9b7f';
                    // = '79fac4642d14c992af83ef497fe563e776ce1cc5d023cb1e4fcb26ed126e59fb';
const mproof =    [
    {
        hash: '0x268a39246efd811aa6b9377910e7a13131de485641907e87fd31ca6bc36a03b1',
        direction: 'right'
    },
    {
        hash: '51fe46cbc3cae464b94d7f51fe5854520e5a50b81d582abe27d025fc610cf2a3',
        direction: 'left'
    },
    {
        hash: '066bd6dbe8abedb589a94829abe1efb7585734d3f487a3ab1dab4a77f8ec28c2',
        direction: 'right'
    },
    {
        hash: '005f44803d10d6a4f8b5112ecf75d55282d7d98c680c3a7c615b45b2e01afcf1',
        direction: 'right'
    }
]










const uproof = mproof.map(pr=>pr.hash);
console.log(uproof);

const isValid = verifyMerkleProofHash('0x578ee1b8ac3c48f984b15621a476a02cbf46be9ee4f0b4691c16476ce389a0d5', mproof, mroot);
console.log(`\nIs a part of the tree?`, isValid);

    // const a = ['tx A', 'tx B', 'tx C', 'tx D', 'tx E'];
// a.forEach(item=>console.log(sha256(item)))
