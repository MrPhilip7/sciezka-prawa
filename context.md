# Polish Legislative Tracker

## Project Breakdown
- **App Name**: Polish Legislative Tracker
- **Platform**: Web

### Summary
The Polish Legislative Tracker aims to demystify the legislative process in Poland by providing a centralized platform where citizens, legal professionals, and journalists can effortlessly track the progress of legislative bills. With real-time updates and intuitive visualizations, the app aspires to promote transparency, accessibility, and informed engagement in the legislative process.

### Primary Use Case
Users can monitor legislative bills from their inception to approval, receiving timely notifications and updates about each bill's status and key events, all within a simple and engaging interface.

### Authentication Requirements
User accounts will be required for accessing personalized features such as saved searches and alerts. Authentication will be managed via Supabase, ensuring a secure sign-in process and user management.

## Tech Stack Overview
- **Frontend Framework**: React + Next.js  
- **UI Library**: Tailwind CSS + ShadCN  
- **Backend (BaaS)**: Supabase (authentication, database, edge functions)  
- **Deployment**: Vercel  

## Core Features
1. **Real-time Bill Updates**  
   Integrate with the Sejm API and ELI API to automatically pull the latest data on legislative proposals and their approval statuses, ensuring users are always informed.

2. **Search and Filter Functionality**  
   Users can conduct keyword searches for specific bills and apply filters based on status, ministry, and other criteria for customized results.

3. **Interactive Timeline View**  
   A visual timeline will represent the progression of bills, highlighting key changes and significant milestones to enhance user engagement and understanding.

## User Flow
1. **User Registration/Login**: Users will authenticate via Supabase, either signing up for a new account or logging in with existing credentials.
2. **Dashboard Access**: Upon successful authentication, users are directed to the main dashboard where they can view an overview of legislative bills.
3. **Searching for Bills**: Users can utilize the search bar and filters to find specific bills relevant to their interests.
4. **Viewing Bill Details**: Clicking on a bill will display detailed information, including status updates and historical data presented in an interactive timeline.
5. **Setting Up Alerts**: Users can opt to receive notifications for updates on bills of interest, which they can manage through their profiles.
6. **Logout**: Users can log out of their accounts, ensuring security of personal information.

## Design and UI/UX Guidelines
- **Simple and Intuitive Layout**: Utilize a clean, straightforward interface that minimizes clutter, ensuring users can easily navigate the site.
- **Responsive Design**: The application should be mobile-friendly, employing Tailwind CSS’s utility-first approach for styling.
- **Accessibility**: Include ARIA labels and ensure high contrast ratios for text elements to enhance accessibility for all users.
- **Consistent Aesthetics**: Maintain uniformity in color schemes, typefaces, and buttons throughout the application using ShadCN components for a cohesive look.

## Technical Implementation Approach
- Use **React + Next.js** to develop a responsive front-end application that loads seamlessly, creating a dynamic user experience with fast rendering times.
- Connect to the **Supabase** backend, leveraging its authentication and real-time capabilities to fetch and store legislative data effectively using edge functions.
- Deploy the application using **Vercel**, ensuring continuous integration and delivery for smooth updates and maintenance.
- **APIs Integration**: Establish connections with the Sejm API and ELI API for real-time data fetching, ensuring efficient and accurate bill monitoring.

## Development Tools and Setup Instructions
1. **Code Editor**: Use Visual Studio Code or your preferred code editor for development.
2. **Node.js and npm**: Ensure Node.js is installed for managing packages.
3. **Create Next.js App**: Set up a new Next.js app using `npx create-next-app@latest .` in your project directory.
4. **Install Dependencies**:
   ```bash
   npm install supabase-js tailwindcss@latest postcss@latest autoprefixer@latest
   ```
5. **Configure Tailwind CSS**: Initialize Tailwind CSS using:
   ```bash
   npx tailwindcss init -p
   ```  
   Then configure the `tailwind.config.js` to scan your project's files.
6. **Connect to Supabase**: Create a new project on Supabase, configure your database, and set up the API keys in your Next.js environment variables.
7. **Deploy on Vercel**: Push your code to a Git repository, then connect to Vercel for seamless deployment and previewing changes.