import React from 'react';
import { VERSION } from '../version';
import { PicklePlusLogo } from './icons/PicklePlusLogo';

/**
 * Footer component for the Pickle+ application.
 * Displays application information, links, and version number.
 */
export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10 sm:py-12 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-8 md:mb-0 text-center md:text-left">
            <PicklePlusLogo className="mx-auto md:mx-0 mb-2" />
            <p className="text-gray-400">The ultimate pickleball companion app</p>
          </div>
          <div className="grid grid-cols-2 md:flex md:flex-row gap-8 sm:gap-12 text-center md:text-left">
            <div className="col-span-1">
              <h3 className="font-bold mb-3 sm:mb-4">Features</h3>
              <ul className="space-y-1 sm:space-y-2 text-gray-400">
                <li>Match Recording</li>
                <li>Achievement System</li>
                <li>Tournament Passport</li>
                <li>Player Rankings</li>
              </ul>
            </div>
            <div className="col-span-1">
              <h3 className="font-bold mb-3 sm:mb-4">Community</h3>
              <ul className="space-y-1 sm:space-y-2 text-gray-400">
                <li>Find Players</li>
                <li>Local Events</li>
                <li>Forums</li>
                <li>Coaching</li>
              </ul>
            </div>
            <div className="col-span-2 mt-6 md:mt-0">
              <h3 className="font-bold mb-3 sm:mb-4">Company</h3>
              <ul className="space-y-1 sm:space-y-2 text-gray-400 md:text-left">
                <li>About Us</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-500">
          <p>© {new Date().getFullYear()} Pickle+. All rights reserved.</p>
          <p className="text-xs mt-2">
            Version {VERSION.number} ({VERSION.name}) - {VERSION.codename}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;