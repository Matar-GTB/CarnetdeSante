import bcrypt from 'bcrypt';

async function testHash() {
    const password = 'TempPassword123!';
    const hashFromDB = '$2b$12$MObCvlFGXOwJIPIauZDOl.9p4/qZkMZZb7i4XXMheB7agEMordoie';
    
    console.log('Mot de passe à tester:', password);
    console.log('Hash en base:', hashFromDB);
    
    // Test de comparaison
    const isValid = await bcrypt.compare(password, hashFromDB);
    console.log('Est-ce que le mot de passe correspond au hash ?', isValid);
    
    // Générons un nouveau hash pour ce mot de passe
    const newHash = await bcrypt.hash(password, 12);
    console.log('Nouveau hash généré:', newHash);
    
    // Test avec le nouveau hash
    const isValidNew = await bcrypt.compare(password, newHash);
    console.log('Est-ce que le mot de passe correspond au nouveau hash ?', isValidNew);
}

testHash().catch(console.error);
