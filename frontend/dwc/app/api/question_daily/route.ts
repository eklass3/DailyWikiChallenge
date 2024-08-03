import axios from 'axios';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  let result;

  // Get the seed from the request URL
  const seed = req.nextUrl.searchParams.get("seed");

  try {
    const response = await axios.get(`http://localhost:5000/seed_gen/${seed}`);
    result = response.data;
  } catch (error) {
    console.error(error);
    result = { message: 'Something went wrong.' };
  }

  return NextResponse.json(result);
}