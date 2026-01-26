#!/bin/bash
# Script untuk add Vercel Environment Variables via CLI
# Usage: bash vercel-cli-commands.sh

# Pastikan sudah login: vercel login

echo "Adding Vercel Environment Variables..."

# Client-side variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production <<< "AIzaSyBudBlQo86hBrf5FoN9kpOf3i9adxg9ShU"
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production <<< "crm-pt-rad.firebaseapp.com"
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production <<< "crm-pt-rad"
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production <<< "crm-pt-rad.firebasestorage.app"
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production <<< "1096984236949"
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production <<< "1:1096984236949:web:119c4bafc4b01691909c9c"
vercel env add NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID production <<< "G-7NBLHP2WS4"

# Server-side variable (Anda perlu replace dengan Service Account Key yang valid)
echo ""
echo "⚠️  PENTING: Anda perlu menambahkan FIREBASE_SERVICE_ACCOUNT_KEY secara manual"
echo "   Gunakan command berikut dan paste Service Account Key JSON (single line):"
echo "   vercel env add FIREBASE_SERVICE_ACCOUNT_KEY production"
echo ""

echo "✅ Client-side variables sudah ditambahkan!"
echo "   Jangan lupa tambahkan FIREBASE_SERVICE_ACCOUNT_KEY!"






