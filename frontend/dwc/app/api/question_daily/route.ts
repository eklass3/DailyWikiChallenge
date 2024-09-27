import axios from 'axios';
import { NextResponse, NextRequest } from 'next/server';

const localURL = "http://localhost:5000"
const remoteURL = process.env.REMOTE_API_ENDPOINT

export async function GET(req: NextRequest) {
  let result;

  // Get the seed from the request URL
  const seed = req.nextUrl.searchParams.get("seed");

  console.log("Seed is " + seed);

  try {
    const response = await axios.get(`${remoteURL}/seed_gen/${seed}`);
    result = response.data;
  } catch (error) {
    console.error(error);
    result = { message: 'Something went wrong.' };
  }

  return NextResponse.json(result);
}