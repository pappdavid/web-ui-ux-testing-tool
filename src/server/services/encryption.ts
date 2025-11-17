/**
 * Basic encryption utility for sensitive data
 * 
 * TODO: Replace with proper KMS/vault integration in production
 * This is a simple implementation for development purposes only
 */

import crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'
const KEY_LENGTH = 32
const IV_LENGTH = 16

// TODO: Store encryption key in environment variable or KMS
// For now, using a default key (NOT SECURE FOR PRODUCTION)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(KEY_LENGTH).toString('hex')

function getKey(): Buffer {
  // Use first 32 bytes of the key
  return Buffer.from(ENCRYPTION_KEY.slice(0, KEY_LENGTH * 2), 'hex')
}

/**
 * Encrypts a string value
 * @param text - The text to encrypt
 * @returns Encrypted string (base64 encoded)
 */
export function encrypt(text: string): string {
  try {
    const key = getKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    // Prepend IV to encrypted data
    return iv.toString('hex') + ':' + encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypts an encrypted string
 * @param encryptedText - The encrypted text (base64 encoded)
 * @returns Decrypted string
 */
export function decrypt(encryptedText: string): string {
  try {
    const key = getKey()
    const parts = encryptedText.split(':')
    
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format')
    }
    
    const iv = Buffer.from(parts[0], 'hex')
    const encrypted = parts[1]
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Encrypts an object (converts to JSON first)
 */
export function encryptObject(obj: any): string {
  return encrypt(JSON.stringify(obj))
}

/**
 * Decrypts an encrypted object (parses JSON after decryption)
 */
export function decryptObject(encryptedText: string): any {
  return JSON.parse(decrypt(encryptedText))
}

