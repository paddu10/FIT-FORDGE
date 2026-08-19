const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Setup Babel or ts-node is too complex here, let's just write a script to fetch the user and then call the TS function via tsx
