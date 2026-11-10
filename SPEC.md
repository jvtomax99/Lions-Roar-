Drafted from the code on 2026-11-10. Gaps marked TO FILL for Jose.

# SPEC: Lion's Roar Muay Thai website

## What it does and who it's for

A one-page website for Lion's Roar Muay Thai, Kru William Rivera's gym at
80 W Kingsbridge Rd, Room 6, Bronx, NY 10468. It tells the gym's story,
shows the classes, hours, price and weekly schedule, and gets a visitor to
call, text, email or walk in for a first class. English, with a Spanish
switch.

**Real users (not Jose):**
- **People thinking of joining** (adults, and parents of kids), mostly on a
  phone. They need: what is taught, when, how much, where, and one tap to
  get in touch.
- **Kru William, the gym owner.** He needs the site to show the gym and his
  lineage truthfully, and to bring in new students. He is the source for
  prices, hours, schedule and contact details.

TO FILL: what Kru William most wants from the site (more kids? more adult
members? fight team?), and how he wants new students to reach him first
(call, text, Instagram DM).

## Features (built)

Each line: what it is, then "Done when".

1. **Hero and navigation.** Headline, tagline, "Book your first class",
   gym facts, nav links, phone menu drawer, a sticky book button after the
   hero.
   Done when: on a phone, a visitor sees what the gym is and can reach the
   booking section in one tap from anywhere on the page.
2. **Lion mascot.** Tap the lion in the hero and it roars (animated).
   Done when: a tap plays the roar once and the page stays usable.
3. **English and Spanish (EN | ES).** Spanish loads only when picked and
   is remembered on the next visit. Reviews and quotes stay as said.
   Done when: every visible line on the page, except quotes, reads in
   Spanish after tapping ES, and EN brings it all back.
4. **Kru William's story (Round 01).** Bio, lineage (Sor.Thanikul camp,
   Bangkok), a swipeable timeline, a Norwood News quote, his Wai Kru video
   (YouTube, loads on tap).
   Done when: a visitor can read his path from age 6 to today and play the
   Wai Kru video.
5. **Fight film (Round 02).** Seven reels of fight nights and training.
   Each shows a short silent loop; tap play for the full video with sound.
   Done when: a visitor can pick any reel and watch it with sound on a
   phone.
6. **Champions (Round 03) and the team band.** The four things the gym
   teaches, belts and champions photos.
   Done when: a visitor sees the gym has real champions and why.
7. **Reviews (Round 04).** Six Google reviews, five stars.
   Done when: the reviews show with names as on Google. TO FILL: link to
   the Google listing, and how often to refresh them.
8. **Matthew Rivera (Round 05).** Kru William's son: Tae Kwon Do path,
   Team USA, fight video.
   Done when: a visitor can read his timeline and watch his fight.
9. **Classes (Round 06).** Muay Thai, Boxing, Tae Kwon Do, Jiu-Jitsu, each
   with a short video, and Wrestling marked "Coming soon".
   Done when: each class shows what it is and when it runs, and tapping it
   jumps to the schedule.
10. **Hours, price and weekly schedule (Round 07).** Membership $250 a
    month, "Call to sign up", by-appointment and regular hours, a weekly
    schedule Monday to Friday with a day picker. No weekend classes.
    Done when: a visitor can pick a day and see every class that day.
    TO FILL: confirm with Kru William. The hours card says "6AM to 2PM by
    appointment, 2PM to 8PM regular hours", but the schedule lists Adult
    Muay Thai at 1pm to 3pm, Boxing by appointment 10am to 3pm and
    Jiu-Jitsu 8pm to 9pm. Also: kids price, drop-in price, free trial or
    not, family discount.
11. **Find us (Round 08).** An illustrated 3D map of the block (drag to
    turn, zoom), a Street map mode, routes from the 4 train, the B/D and
    the Bx9 bus, "Get directions" to Google Maps. Zooming in shows a 3D
    Muay Thai fight in the ring (Ringside).
    Done when: a visitor can see where the gym is, show a route, and open
    directions on their phone.
12. **Join (Round 09) and footer.** Call, Text us (prefilled message),
    Email us, Get directions, Instagram.
    Done when: each button opens the right app with the gym's details.
13. **Sharing and search.** Page title, description, share image, gym data
    for search engines (schema.org ExerciseGym), app icons.
    Done when: a shared link shows the gym's name, photo and description.

There is no online form: no booking form, no sign-up form, no payments.
All contact goes by phone, text, email or Instagram.

## Not in v1

TO FILL by Jose. Drafted guesses to confirm or strike:
- Online booking or a class sign-up form.
- Online payments or memberships.
- Member accounts or logins.
- A blog or news feed.

## Later

TO FILL by Jose. Ideas seen in the code or common on gym sites:
- A Wrestling page once the program starts (now "Coming soon").
- Weekend classes, if the gym adds them.
- A link to the gym's Google reviews and map listing.
- A custom domain instead of the github.io address.

## Phases

Phases 1 to 4 are grouped from what the code already has, not from a real
build history.

### Phase 1: The core page (built)
- [x] Hero, nav, phone menu, sticky book button
- [x] Classes, hours, price, weekly schedule
- [x] Join buttons (call, text, email, directions), footer
- [x] Share image, icons, search engine data

### Phase 2: The story and the film (built)
- [x] Kru William's story and timeline, Wai Kru video
- [x] Fight film reels
- [x] Champions, team band, reviews
- [x] Matthew Rivera

### Phase 3: Find us in 3D (built)
- [x] Illustrated 3D map, street map, transit routes
- [x] Ringside 3D fight (`ringside.js`, `ringside.glb`)
- [x] Lion mascot roar

### Phase 4: Spanish (built)
- [x] EN | ES switch with `i18n/es.js`

### Phase 5: TO FILL
- [ ] Confirm hours, schedule and prices with Kru William (see feature 10)
- [ ] TO FILL: next features Jose picks
