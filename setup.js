const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const net = require('net');

// Define default environment configurations for all services and frontends
const ENVS = {
  'admin-frontend/.env': 'VITE_AUTH_SERVICE_URL=http://localhost:3000/auth\n',
  'backend/admin_service/.env': `PORT=3009
MONGODB_URI=mongodb://localhost:27017/ridehive_admin
JWT_SECRET=goodkeymustchange
INTERNAL_SERVICE_KEY=super-secret-key-change-this

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
DRIVER_SERVICE_URL=http://localhost:3003
RIDE_SERVICE_URL=http://localhost:3004
NOTIFICATION_SERVICE_URL=http://localhost:3007
FEEDBACK_SERVICE_URL=http://localhost:3006
`,
  'backend/api_gateway/.env': `PORT=3000

# Security Keys
JWT_SECRET=goodkeymustchange
INTERNAL_SERVICE_KEY=super-secret-key-change-this

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
RIDER_SERVICE_URL=http://localhost:3002
DRIVER_SERVICE_URL=http://localhost:3003
RIDE_SERVICE_URL=http://localhost:3004
PAYMENT_SERVICE_URL=http://localhost:3005
NOTIFICATION_SERVICE_URL=http://localhost:3007
POOL_SERVICE_URL=http://localhost:3008
ADMIN_SERVICE_URL=http://localhost:3009
FEEDBACK_SERVICE_URL=http://localhost:3006

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,https://localhost:5173,http://localhost:5174,https://localhost:5174,http://localhost:5175,https://localhost:5175
`,
  'backend/auth_service/.env': `PORT=3001
MONGODB_URI=mongodb://localhost:27017/ridehive_auth
JWT_SECRET=goodkeymustchange
INTERNAL_SERVICE_KEY=super-secret-key-change-this
ADMIN_SERVICE_URL=http://localhost:3009
`,
  'backend/driver_service/.env': `PORT=3003
MONGODB_URI=mongodb://localhost:27017/ridehive_driver
JWT_SECRET=goodkeymustchange
INTERNAL_SERVICE_KEY=super-secret-key-change-this
AUTH_SERVICE_URL=http://localhost:3001
ADMIN_SERVICE_URL=http://localhost:3009
`,
  'backend/feedback_service/.env': `PORT=3006
MONGODB_URI=mongodb://localhost:27017/ridehive_feedback
JWT_SECRET=goodkeymustchange
INTERNAL_SERVICE_KEY=super-secret-key-change-this
`,
  'backend/notification_service/.env': `PORT=3007
MONGODB_URI=mongodb://localhost:27017/ridehive_notification
JWT_SECRET=goodkeymustchange
INTERNAL_SERVICE_KEY=super-secret-key-change-this
ADMIN_SERVICE_URL=http://localhost:3009
`,
  'backend/payment_service/.env': `PORT=3005
MONGODB_URI=mongodb://localhost:27017/ridehive_payment
JWT_SECRET=goodkeymustchange
INTERNAL_SERVICE_KEY=super-secret-key-change-this
AUTH_SERVICE_URL=http://localhost:3001
DRIVER_SERVICE_URL=http://localhost:3003
`,
  'backend/pool_service/.env': `PORT=3008
MONGODB_URI=mongodb://localhost:27017/ridehive_pool
JWT_SECRET=goodkeymustchange
INTERNAL_SERVICE_KEY=super-secret-key-change-this

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
RIDER_SERVICE_URL=http://localhost:3002
DRIVER_SERVICE_URL=http://localhost:3003
RIDE_SERVICE_URL=http://localhost:3004
PAYMENT_SERVICE_URL=http://localhost:3005
FEEDBACK_SERVICE_URL=http://localhost:3006
NOTIFICATION_SERVICE_URL=http://localhost:3007
ADMIN_SERVICE_URL=http://localhost:3009
`,
  'backend/rider_service/.env': `PORT=3002
MONGODB_URI=mongodb://localhost:27017/ridehive_rider
JWT_SECRET=goodkeymustchange
INTERNAL_SERVICE_KEY=super-secret-key-change-this
AUTH_SERVICE_URL=http://localhost:3001
`,
  'backend/ride_service/.env': `PORT=3004
MONGODB_URI=mongodb://localhost:27017/ridehive_ride
JWT_SECRET=goodkeymustchange
INTERNAL_SERVICE_KEY=super-secret-key-change-this

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
RIDER_SERVICE_URL=http://localhost:3002
DRIVER_SERVICE_URL=http://localhost:3003
PAYMENT_SERVICE_URL=http://localhost:3005
NOTIFICATION_SERVICE_URL=http://localhost:3007
ADMIN_SERVICE_URL=http://localhost:3009
`,
  'driver-frontend/.env': `VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3004
`,
  'ride-frontend/.env': `VITE_API_URL=http://localhost:3000
`
};

// Color helper function for nice console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
};

function printHeader() {
  console.log(`\n${colors.blue}${colors.bright}=============================================================`);
  console.log(`     🚀  RIDE-HIVE MONOREPO MASTER SETUP INITIATED  🚀`);
  console.log(`=============================================================${colors.reset}\n`);
}

// Function to test if MongoDB is running locally
function checkMongoDB() {
  return new Promise((resolve) => {
    process.stdout.write(`🔍 Checking local MongoDB status (port 27017)... `);
    const client = new net.Socket();
    client.setTimeout(2000);

    client.on('connect', () => {
      console.log(`${colors.green}${colors.bright}[RUNNING]${colors.reset}`);
      client.destroy();
      resolve(true);
    });

    client.on('timeout', () => {
      console.log(`${colors.yellow}${colors.bright}[TIMEOUT]${colors.reset}`);
      console.log(`   ${colors.yellow}⚠️  Note: MongoDB might be running but taking time to respond, or it is stopped.${colors.reset}`);
      client.destroy();
      resolve(false);
    });

    client.on('error', () => {
      console.log(`${colors.red}${colors.bright}[NOT RUNNING]${colors.reset}`);
      console.log(`   ${colors.red}❌ MongoDB must be running locally on port 27017 to connect successfully.${colors.reset}`);
      resolve(false);
    });

    client.connect(27017, '127.0.0.1');
  });
}

// Check and configure environment files
function setupEnvFiles() {
  console.log(`🔍 Checking and configuring service environment files...`);
  let createdCount = 0;
  let verifiedCount = 0;

  for (const [relPath, content] of Object.entries(ENVS)) {
    const fullPath = path.join(__dirname, relPath);
    const dir = path.dirname(fullPath);

    // Make sure directory exists (e.g. for microservices or frontends)
    if (!fs.existsSync(dir)) {
      console.log(`   📂 Creating missing directory: ${relPath.split('/')[0]}`);
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`   ${colors.green}✓ Created${colors.reset} ${relPath}`);
      createdCount++;
    } else {
      console.log(`   ${colors.blue}✓ Verified${colors.reset} ${relPath} (already exists)`);
      verifiedCount++;
    }
  }

  console.log(`\n📊 Environment Configuration Summary:`);
  console.log(`   - Verified: ${colors.blue}${verifiedCount}${colors.reset}`);
  console.log(`   - Created:  ${colors.green}${createdCount}${colors.reset}\n`);
}

// Helper to recursively find all directories containing a package.json (excluding node_modules and .git)
function findPackageJsonDirs(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file === 'node_modules' || file === '.git') continue;
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        findPackageJsonDirs(filePath, fileList);
      } else if (file === 'package.json' && dir !== __dirname) {
        fileList.push(dir);
      }
    }
  } catch (err) {
    // Ignore read errors
  }
  return fileList;
}

// Install workspace dependencies
function installDependencies() {
  console.log(`📦 Installing project-wide dependencies using npm workspaces...`);
  console.log(`   (This may take a moment. Running 'npm install' at root level...)`);
  
  const result = spawnSync('npm', ['install'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname,
  });

  if (result.status === 0) {
    console.log(`\n${colors.green}✓ Workspace dependencies successfully installed!${colors.reset}\n`);
    return true;
  }

  console.log(`\n${colors.yellow}⚠️  Workspace-level installation failed or had issues.${colors.reset}`);
  console.log(`⚙️  Initiating fallback: Installing dependencies individually in each service...\n`);

  const subDirs = findPackageJsonDirs(__dirname);
  
  if (subDirs.length === 0) {
    console.log(`${colors.red}❌ No individual service directories with package.json found!${colors.reset}\n`);
    return false;
  }

  console.log(`Found ${subDirs.length} individual packages to install:`);
  subDirs.forEach(dir => console.log(`   - ${path.relative(__dirname, dir)}`));
  console.log('');

  let overallSuccess = true;

  for (const dir of subDirs) {
    const relativePath = path.relative(__dirname, dir);
    console.log(`-------------------------------------------------------------`);
    console.log(`📦 Installing dependencies in: ${colors.blue}${relativePath}${colors.reset}...`);
    console.log(`-------------------------------------------------------------`);

    const subResult = spawnSync('npm', ['install'], {
      stdio: 'inherit',
      shell: true,
      cwd: dir,
    });

    if (subResult.status !== 0) {
      console.log(`\n${colors.red}❌ Failed to install dependencies in: ${relativePath}${colors.reset}\n`);
      overallSuccess = false;
    } else {
      console.log(`\n${colors.green}✓ Successfully installed dependencies in: ${relativePath}${colors.reset}\n`);
    }
  }

  if (overallSuccess) {
    console.log(`${colors.green}✓ All individual services successfully installed!${colors.reset}\n`);
    return true;
  } else {
    console.log(`${colors.yellow}⚠️  Some services failed to install dependencies. Please check individual logs above.${colors.reset}\n`);
    return false;
  }
}

// Main runner function
async function run() {
  printHeader();

  // 1. Check MongoDB
  const mongoRunning = await checkMongoDB();

  // 2. Setup Env Files
  setupEnvFiles();

  // 3. Install Workspace Deps
  const installSuccess = installDependencies();

  if (installSuccess) {
    console.log(`${colors.green}${colors.bright}=============================================================`);
    console.log(`🎉 SETUP COMPLETED SUCCESSFULLY!`);
    console.log(`=============================================================${colors.reset}\n`);

    if (!mongoRunning) {
      console.log(`${colors.yellow}${colors.bright}⚠️  IMPORTANT ACTION REQUIRED:${colors.reset}`);
      console.log(`   Please make sure your MongoDB instance is running before starting the services.`);
      console.log(`   To start MongoDB locally (if installed as a service):`);
      console.log(`     - Windows: Start the 'MongoDB' service in services.msc or run 'net start MongoDB'`);
      console.log(`     - macOS/Linux: Run 'brew services start mongodb-community' or 'sudo systemctl start mongod'`);
      console.log('');
    }

    console.log(`${colors.bright}🚀 HOW TO RUN THE PROJECT:${colors.reset}`);
    console.log(`   To start all microservices and frontends concurrently:`);
    console.log(`     ${colors.blue}npm run dev${colors.reset}`);
    console.log('');
    console.log(`   To start ONLY the backend microservices (Gateway + 9 Services):`);
    console.log(`     ${colors.blue}npm run start:all${colors.reset}`);
    console.log('');
    console.log(`   To start ONLY the frontend applications (Rider, Driver, Admin):`);
    console.log(`     ${colors.blue}npm run start:frontend${colors.reset}`);
    console.log('');
    console.log(`   Or run individual frontends:`);
    console.log(`     - Rider Frontend:  ${colors.blue}npm run start:Riderfrontend${colors.reset}`);
    console.log(`     - Driver Frontend: ${colors.blue}npm run start:Driverfrontend${colors.reset}`);
    console.log(`     - Admin Frontend:  ${colors.blue}npm run start:Adminfrontend${colors.reset}`);
    console.log('\nEnjoy building Ride-Hive! 🚖\n');
  } else {
    console.log(`${colors.red}${colors.bright}=============================================================`);
    console.log(`❌ SETUP FAILED DURING DEPENDENCY INSTALLATION`);
    console.log(`=============================================================${colors.reset}\n`);
  }
}

run();
