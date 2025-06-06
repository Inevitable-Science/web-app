## Data Holes
Press CMD + F or CTRL + F and search for "DATA_TODO" to find these in each file

Header - web-app/src/app/[...slug]/components/NetworkDashboard/Header/Header.tsx 
 - DAO Backdrop URL
 - DAO @
 - ETH Raised
 - Payments
 - % return
 - Owner
 - Date Created

Description/About - web-app/src/app/[...slug]/components/NetworkDashboard/sections/DescriptionSection/DescriptionSection.tsx
 - Secondary Description - description below the analytics, refer to figma

Main DAO Content - web-app/src/app/[...slug]/components/NetworkDashboard/NetworkDashboard.tsx
 - DAO Name (already done I think)
 - Token Name
 - Conditionally Render SwapWidget if the DAO is not in presale & pass it the token address

DAO Socials Component - web-app/src/app/[...slug]/components/NetworkDashboard/sections/DescriptionSection/SocialLinks.tsx
 - DAO Discord URL
 - DAO X URL

Swap Wiget - web-app/src/app/[...slug]/components/PayCard/SwapWiget/SwapWiget.tsx
 - Pass the eth window provider to the modal, no secondary connect wallet req



NEW CHANGES

New Pay Card - web-app/src/app/[...slug]/components/PayCard/PayDummy.tsx
 - Add functionality to the pay modal

Activity Graph - web-app/src/app/[...slug]/components/NetworkDashboard/Components/ActivityGraph.tsx
- Make graph functional, volume and trending chart

Activity Feed - web-app/src/app/[...slug]/components/ActivityFeed.tsx
- Add functionality to view changes to the project rules

Cycle/Rules Page - src/app/[...slug]/components/NetworkDetailsTable.tsx
 - Add functionality to map the Cycles, Token and Other Rules function

Not Required Currently But In Future
Live auction data (to homepage) : ref to figma
 - Auction Name
 - Auction Description
 - Auction href/url (go to auction URL)
 - ETH Raised
 - Time left till close (date)
 - % funded
 - bg url (potentially)


#### Note:
Please check the build process, I ran `npm install @cowprotocol/widget-react --legacy-peer-deps` hopefully theres no breaking changes, not to familar with the indepth things of NPM.

also

Upon completion please delete the following files
 - web-app/src/app/[...slug]/components/NetworkDashboard/Header/Creation.tsx
 - web-app/src/app/[...slug]/components/NetworkDashboard/Header/TvlDatum.tsx