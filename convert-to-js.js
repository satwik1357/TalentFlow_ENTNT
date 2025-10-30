import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to find all TypeScript files
function findTypeScriptFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('.git')) {
      findTypeScriptFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to convert TypeScript to JavaScript
function convertToJS(filePath) {
  try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove TypeScript type annotations (simplified version)
    content = content
      // Remove type imports
      .replace(/import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g, 'import { $1 } from "$2"')
      // Remove type exports
      .replace(/export\s+(?:type|interface|enum)\s+\w+/g, '')
      // Remove type annotations from function parameters
      .replace(/(\([^)]*):\s*([^{=:;]+)(?=[),])/g, '$1')
      // Remove type annotations from variables
      .replace(/(const|let|var)\s+(\w+)\s*:\s*([^=;]+)(?=;|=)/g, '$1 $2')
      // Remove type assertions (as Type)
      .replace(/\s+as\s+[\w.]+/g, '')
      // Remove interface definitions
      .replace(/interface\s+\w+\s*{[^}]*}/g, '')
      // Remove type imports
      .replace(/import\s+type\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g, 'import { $1 } from "$2"')
      // Remove empty lines with only whitespace
      .replace(/^\s*\n/gm, '');
    
    // Create new file path with .jsx extension
    const newPath = filePath.endsWith('.tsx') 
      ? filePath.replace(/\.tsx$/, '.jsx')
      : filePath.replace(/\.ts$/, '.js');
    
    // Write the converted content to the new file
    fs.writeFileSync(newPath, content);
    
    // Delete the original TypeScript file
    fs.unlinkSync(filePath);
    
    console.log(`Converted: ${filePath} -> ${newPath}`);
    return true;
  } catch (error) {
    console.error(`Error converting ${filePath}:`, error.message);
    return false;
  }
}

// Main function
function main() {
  console.log('Starting TypeScript to JavaScript conversion...');
  
  // Find all TypeScript files
  const tsFiles = findTypeScriptFiles('.');
  console.log(`Found ${tsFiles.length} TypeScript files to convert.`);
  
  // Convert each file
  let successCount = 0;
  tsFiles.forEach(filePath => {
    if (convertToJS(filePath)) {
      successCount++;
    }
  });
  
  console.log(`\nConversion complete!`);
  console.log(`Successfully converted ${successCount} of ${tsFiles.length} files.`);
  
  // Update package.json to remove TypeScript dependencies
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Remove TypeScript dependencies
    const tsDependencies = [
      'typescript',
      '@types/react',
      '@types/react-dom',
      '@types/node',
      '@typescript-eslint/parser',
      '@typescript-eslint/eslint-plugin'
    ];
    
    if (packageJson.devDependencies) {
      tsDependencies.forEach(dep => {
        if (packageJson.devDependencies[dep]) {
          delete packageJson.devDependencies[dep];
        }
      });
    }
    
    // Update scripts
    if (packageJson.scripts) {
      packageJson.scripts.lint = 'eslint . --ext .js,.jsx';
    }
    
    // Write updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('\nUpdated package.json to remove TypeScript dependencies.');
    
  } catch (error) {
    console.error('Error updating package.json:', error.message);
  }
  
  console.log('\nPlease run the following commands to complete the setup:');
  console.log('1. npm install');
  console.log('2. npm run dev');
}

// Run the conversion
main();
