import sslProfiles from 'aws-ssl-profiles'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

let pool

export const handler = async (event) => {
  const { username, password } = event ?? {}

  if (typeof username !== 'string' || username.trim() === '') {
    throw new Error('Username is required')
  }

  if (typeof password !== 'string' || password.trim() === '') {
    throw new Error('Password is required')
  }
  
  if (Array.from(username.trim()).length > 100 || bcrypt.truncates(password)) {
    throw new Error('Invalid login credentials')
  }

  let center

  try {
    
    pool ??= mysql.createPool({
      host: 	process.env.RDS_HOST,
      user: 	process.env.RDS_USER,
      password: process.env.RDS_PASSWORD,
      database: process.env.RDS_DATABASE,
      ssl: { ca: sslProfiles.ca, verifyIdentity: true },
    })
    const [rows] = await pool.execute(
      `SELECT  name, username, password_hash, is_active
      FROM donation_centers
      WHERE username = ?`,
      [username.trim()],)
    center = rows[0]

  } catch {
    throw new Error('Could not sign in')
  }

  if (!center || !(await bcrypt.compare(password, center.password_hash))) {
    throw new Error('Invalid login credentials')
  } 

  if (Number(center.is_active) !== 1) {
    throw new Error('Donation center registration is inactive')
  }

  const secret = process.env.DONATION_CENTER_JWT_SECRET

  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('Could not sign in')
  }

  const token = jwt.sign({}, secret, {algorithm: 'HS256', audience: 'donazion:donation-center',  subject: center.username, expiresIn: '1h', })

  return { name: center.name, token }

}
