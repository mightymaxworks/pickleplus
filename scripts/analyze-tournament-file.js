const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read the Excel file
const filePath = path.join(process.cwd(), 'attached_assets', '9.8-9.14周赛分数_1758011644415.xlsx');

try {
    // Read the workbook
    const workbook = XLSX.readFile(filePath);
    
    // Get all sheet names
    const sheetNames = workbook.SheetNames;
    console.log('📋 Sheet Names:', sheetNames);
    console.log('=====================================\n');
    
    // Process each sheet
    sheetNames.forEach((sheetName, index) => {
        console.log(`📊 Sheet ${index + 1}: ${sheetName}`);
        console.log('=====================================');
        
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON to analyze structure
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length > 0) {
            // Show first few rows to understand structure
            console.log('🔍 First 10 rows:');
            jsonData.slice(0, 10).forEach((row, rowIndex) => {
                console.log(`Row ${rowIndex + 1}:`, row);
            });
            
            console.log(`\n📈 Total rows: ${jsonData.length}`);
            
            // Try to identify columns that might contain names, passport codes, scores, etc.
            if (jsonData.length > 1) {
                const headers = jsonData[0];
                console.log('🏷️ Detected Headers:', headers);
                
                // Analyze data types in each column
                console.log('\n🔍 Column Analysis:');
                headers.forEach((header, colIndex) => {
                    const sampleValues = jsonData.slice(1, 6).map(row => row[colIndex]).filter(val => val != null);
                    console.log(`Column ${colIndex + 1} (${header}):`, sampleValues);
                });
            }
        } else {
            console.log('❌ No data found in this sheet');
        }
        
        console.log('\n=====================================\n');
    });
    
} catch (error) {
    console.error('❌ Error reading Excel file:', error.message);
    console.error('File path attempted:', filePath);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log('✅ File exists, size:', stats.size, 'bytes');
    } else {
        console.log('❌ File does not exist at path:', filePath);
    }
}