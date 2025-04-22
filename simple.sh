#!/bin/bash
# Super simple deployment script - the absolute easiest approach

# Set the server to use port 8080
node -e "const fs=require('fs');const file='server/index.ts';let content=fs.readFileSync(file,'utf8');content=content.replace(/port = process.env.NODE_ENV === 'production' \? 8080 : 5000/g,'port = 8080');content=content.replace(/port = process.env.PORT \|\| 5000/g,'port = 8080');fs.writeFileSync(file,content);"

echo "✅ Simplified deployment preparation complete!"
echo ""
echo "To deploy:"
echo "  1. Click Deploy button in Replit"
echo "  2. Use these settings:"
echo "     - Build Command: npm install" 
echo "     - Run Command: npx tsx server/index.ts"
echo "  3. Click Deploy"