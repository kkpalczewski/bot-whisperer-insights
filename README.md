
# Bot Whisperer Insights

A lightweight, straightforward application for exploring bot detection methods and browser fingerprinting.

## Features

- **Detection Feature Explorer**: Visualize and test various browser, hardware, and behavior fingerprinting techniques
- **Fingerprinting Library Information**: Learn about popular fingerprinting libraries like FingerprintJS and CreepJS
- **User Authentication**: Simple login with Google or Github
- **Fingerprint Submission**: Save your browser fingerprint for further analysis

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## Connecting Supabase

This application uses Supabase for authentication and database storage. To connect your own Supabase instance:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Use the Lovable Supabase integration to connect your project
3. Run the SQL setup script included in `supabase.sql` in your Supabase SQL editor

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Shadcn UI
- Supabase (auth and database)
- FingerprintJS

## License

MIT
