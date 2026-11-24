import { pool } from "./connection.mjs"
import bcrypt from 'bcryptjs'



function isBlank(value) {
  return typeof value !== 'string' || value.trim() === ''
}

export const handler = async (event) => {
  const { name, streetAddress, latitude, longitude, username, password } = event ?? {}

  if (isBlank(name)) {
    throw new Error('Donation center name required')
  }

  if (Array.from(name.trim()).length > 100) {
    throw new Error('Donation center name must be less than or equal to 100 characters')
  }

  if (isBlank(streetAddress)) {
    throw new Error('Street address required')
  }

  if (Array.from(streetAddress.trim()).length > 100) {
    throw new Error('Street address must be less than or equal to 100 characters')
  }

  if (isBlank(username)) {
    throw new Error('Username required')
  }

  if (Array.from(username.trim()).length > 100) {
    throw new Error('Username must be less than or equal to 100 characters')
  }
  if (isBlank(password)) {
    throw new Error('Password required')
  }

  if (bcrypt.truncates(password)) {
    throw new Error('Password must be 72 bytes or fewer') //bcrypt input limit
  }
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new Error('Latitude must be a number between -90 and 90')
  }

  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error('Longitude must be a number between -90 and 90')
  }

  const centerName = name.trim()

  try {
    

    const passwordHash = await bcrypt.hash(password, 10)

    await pool.execute(
      `INSERT INTO donation_centers
      (name, address, latitude, longitude, username, password_hash)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [centerName, streetAddress.trim(), latitude, longitude, username.trim(), passwordHash],
    ) 
  }

    catch (error) {
    console.error('Registration detail:', error?.code ?? error?.name, error?.message)
    
    if (error?.code === 'ER_DUP_ENTRY') {
      throw new Error('Username already in use')
    }
    throw new Error('Could not register the donation center')
  }

    return { message: 'Donation center registered successfully', name: centerName}

}
