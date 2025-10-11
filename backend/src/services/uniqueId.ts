
export const  generateUniqueId = (length: number = 16): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charsLength = chars.length;

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charsLength);
        result += chars.charAt(randomIndex);
    }

    return result;
}


const id16 = generateUniqueId();
console.log(`16-Character ID: ${id16} (Length: ${id16.length})`);

const id24 = generateUniqueId(24);
console.log(`24-Character ID: ${id24} (Length: ${id24.length})`);


