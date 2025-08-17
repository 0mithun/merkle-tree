const crypto =  require('crypto');
const LEFT = 'left'
const RIGHT = 'right'

const listOfHashes = [
    '0x0b46cbd82d0fe12c84fd676f2f6e4df01793fba1a88b49c6563f0487b9c14285',
    '0x6ef163a08119da6c77d64c32946ab80a0e6c91c34612856be8a201a3673919c2',
    '0x578ee1b8ac3c48f984b15621a476a02cbf46be9ee4f0b4691c16476ce389a0d5',
    '0x268a39246efd811aa6b9377910e7a13131de485641907e87fd31ca6bc36a03b1',
    '0x7dff748603fdeba8b761df81c372390c4fc4a6006e1c74933b81bd54dd904073',
    '0x0624dc85cea85575ed94a290b5c3b3a0caa8a1c2e888c287f0689d4e4f4d4ba5',
    '0x4ff2928281aa0d7f48d025576f0bad4794eb26cadf06e177a1ca073ff451eec7',
    '0xba7f0db9e9ef33eeea0ef0645738c28328fe5e95acdcb8812b96437c9fde0ef1',
    '0xb840fa85ebb73022fc52965f67a987cd8be7b0e22d1e5b8e4c898e3687f360b0',
    '0x10e2dae66b1eed88f323ba69066a9f5d9cf7d1ae8f67e20a39fc898a1f4aad73',
    '0x717dfefbb729adb0fc1b8982dd345161b19613ece76737ba75400de41802c11c',
    '0x2562ea7215f843b9d6cacb3449e9af8caf9bea6a9735791b8072263b1a883ba0',
    '0xff693258f9bed50e203866937b5f6a1941eaea4633092ee539f3796cde1cd823',
    '0x6e657fc4835f14a0f3dee237c4fb3d91f1a7105b752f66f573cfd165e32247e5',
    '0x555d04168bbfda587aeda61805b3dd4dd70aa62613a8671dc871109b66081e19',

    // '0f9953d2c55cd81d889bc0f758c9bd4f0a6c6b42d70fa8fc784d8e5d20bc0098',
    // 'ca27083fd950a3e468ee0cf45ad6e37939452f93e38cc3c0911a580002fc7367',
    // 'ce1caf5ee19b65153fbc95421611a4c187598cf853ab2dd3eec7cae8f3d5b87d',
    // 'd0d54711a10d4deb7ba8fa3fc0e7075c8fba88fcfc3e00efbfe42eb46d373596',
    // '6a0e8850a8be8818cfc1be924c45090731068f4028815bec335d237046e9d474'


];


const makeHash = (data) => {
    return crypto.createHash('sha256').update(data).digest().toString('hex')
}

const findDirectionOfHash =(hash, tree)=> {
    const hashIndex = tree[0].findIndex(h=> h===hash);

    return hashIndex % 2 === 0 ? LEFT : RIGHT;
}

const isEven = (hashes)=> {
    if(hashes.length % 2 !==0) {
        hashes.push(hashes[hashes.length - 1]);
    }
}


const FindRootOfHashes = (hashes) => {
    if(!hashes || hashes.length === 0) {
        return ''
    }

    isEven(hashes)
    const listOfTheHashes = []
    for(let i = 0; i < hashes.length; i+=2) {
        const hashPairConcatenated = [ hashes[i] , hashes[i +1]].sort().join('');

        const hash = makeHash(hashPairConcatenated);

        listOfTheHashes.push(hash)
    }

    if(listOfTheHashes.length === 1) {
        return listOfTheHashes.join('')
    }

    return FindRootOfHashes(listOfTheHashes)
}


const rootHash = FindRootOfHashes(listOfHashes)
console.log('The root of this list of hashes:', rootHash)


const findTreeOfHashes = (hashes)=> {
    if(!hashes || hashes.length ===0){
        return []
    }
    // console.log(hashes)
    const tree = [hashes]

    const createTree = (hashes, tree) => {
        if(hashes.length === 1) {
            return hashes
        }
        isEven(hashes)

        const listOfTheHashes =  []
        for(let i = 0; i < hashes.length; i+=2) {
            const hashesConcatenated = [ hashes[i] , hashes[i +1]].sort().join('');

            const hash = makeHash(hashesConcatenated);
            listOfTheHashes.push(hash)
        }

        tree.push(listOfTheHashes)
        return createTree(listOfTheHashes, tree)
    }

    // console.log('tree', tree)
    createTree(hashes, tree)

    return tree
}


const treeHashes = findTreeOfHashes(listOfHashes)

// console.log('This is our Merkle tree:', treeHashes)


const findTheMerkleProof = (hash, hashes)=> {
    if(!hash || !hashes || hashes.length === 0) {
        return null
    }

    const tree = findTreeOfHashes(hashes)

    const merkleProof = [
        // {
        //     hash: hash,
        //     direction: findDirectionOfHash(hash, tree)
        // }
    ]

    let hashIndex = tree[0].findIndex(h=> h===hash)

    for(let level = 0; level < tree.length - 1; level++) {
        const isLeftChild = hashIndex % 2 === 0
        const siblingDirection = isLeftChild ? RIGHT : LEFT;
        const siblingIndex = isLeftChild ? hashIndex +1 : hashIndex - 1;
        const siblingNode = {
            hash: tree[level][siblingIndex],
            direction: siblingDirection,
        };

        merkleProof.push(siblingNode)

        hashIndex = Math.floor(hashIndex / 2)
    }

    return merkleProof
}


const findMerkleProof = findTheMerkleProof(listOfHashes[3], listOfHashes)
console.log('findMerkleProof:', findMerkleProof)


const verifyMerkleProof = (findHash, proof, merkleRoot) => {
    let computedHash = findHash;

    for (const siblingHash of proof) {
        if(siblingHash.direction === RIGHT) {
            computedHash = makeHash(siblingHash.hash + computedHash)
        }else {
            computedHash = makeHash(computedHash + siblingHash.hash);
        }
    }

    return computedHash === merkleRoot;
}

const isValid = verifyMerkleProof(listOfHashes[3], findMerkleProof, rootHash);

console.log('Valid:', isValid)