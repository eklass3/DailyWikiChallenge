import axios from 'axios';
import { NextResponse, NextRequest } from 'next/server';

const localURL = "http://localhost:5000"
const remoteURL = "https://daily-wiki-challenge-image-ov6nxn2mva-uc.a.run.app"

export async function GET(req: NextRequest) {
  let result;
  let categoryParam = req.nextUrl.searchParams.get('category');
  let articleParam = req.nextUrl.searchParams.get('article');

  if (categoryParam !== null) {
    categoryParam = categoryParam.replace(/ /g, "_")
  }

  if (articleParam !== null) {
    articleParam = articleParam.replace(/ /g, "_")
  }

  console.log("RUNNING TEST MODE GET QUESTION");
  try {
    const response = await axios.get(`${remoteURL}/generate/${categoryParam}/${articleParam}`);
    result = response.data;
  } catch (error) {
    console.error(error);
    result = { message: 'Something went wrong.' };
  }

  return NextResponse.json(result);
}