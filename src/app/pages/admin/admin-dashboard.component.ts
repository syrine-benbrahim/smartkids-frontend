// admin-dashboard.component.ts - Unified Design
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Welcome Banner with Playful Design -->
    <div class="bg-gradient-to-br from-pink-500 via-orange-500 to-yellow-500 rounded-3xl p-8 mb-8 relative overflow-hidden shadow-xl">
      <!-- Decorative elements -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      <div class="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
      
      <div class="relative z-10">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-black text-white mb-2">Welcome back, {{ getUserName() }}! 👋</h1>
            <p class="text-white/90 text-lg">Here's what's happening with your kindergarten today</p>
          </div>
          <div class="hidden lg:flex items-center space-x-3">
            <div class="text-right">
              <p class="text-white/90 text-sm">Today's Date</p>
              <p class="text-white text-lg font-bold">{{ getCurrentDate() }}</p>
            </div>
            <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Grid with Playful Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      
      <!-- Students Card -->
      <div class="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-4 border-blue-100">
        <div class="flex items-center justify-between mb-4">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </div>
          <div class="text-blue-500 text-2xl animate-bounce-slow">👶</div>
        </div>
        <div>
          <p class="text-gray-600 text-sm font-bold mb-1 uppercase tracking-wide">Total Students</p>
          <p class="text-4xl font-black text-gray-900 mb-2">150</p>
          <div class="flex items-center text-green-600 text-sm font-semibold">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
            </svg>
            +12% from last month
          </div>
        </div>
      </div>

      <!-- Teachers Card -->
      <div class="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-4 border-green-100">
        <div class="flex items-center justify-between mb-4">
          <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <div class="text-green-500 text-2xl animate-bounce-slow" style="animation-delay: 0.1s;">👩‍🏫</div>
        </div>
        <div>
          <p class="text-gray-600 text-sm font-bold mb-1 uppercase tracking-wide">Teachers</p>
          <p class="text-4xl font-black text-gray-900 mb-2">25</p>
          <div class="flex items-center text-green-600 text-sm font-semibold">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
            </svg>
            +3 new this year
          </div>
        </div>
      </div>

      <!-- Parents Card -->
      <div class="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-4 border-purple-100">
        <div class="flex items-center justify-between mb-4">
          <div class="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          <div class="text-purple-500 text-2xl animate-bounce-slow" style="animation-delay: 0.2s;">👨‍👩‍👧</div>
        </div>
        <div>
          <p class="text-gray-600 text-sm font-bold mb-1 uppercase tracking-wide">Active Parents</p>
          <p class="text-4xl font-black text-gray-900 mb-2">280</p>
          <div class="flex items-center text-purple-600 text-sm font-semibold">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"/>
            </svg>
            95% engagement rate
          </div>
        </div>
      </div>

      <!-- Activities Card -->
      <div class="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-4 border-yellow-100">
        <div class="flex items-center justify-between mb-4">
          <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div class="text-yellow-500 text-2xl animate-bounce-slow" style="animation-delay: 0.3s;">🎨</div>
        </div>
        <div>
          <p class="text-gray-600 text-sm font-bold mb-1 uppercase tracking-wide">Activities Today</p>
          <p class="text-4xl font-black text-gray-900 mb-2">12</p>
          <div class="flex items-center text-yellow-600 text-sm font-semibold">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
            8 scheduled, 4 completed
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section with Playful Design -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      <!-- Attendance Chart -->
      <div class="bg-white rounded-3xl p-8 shadow-sm border-4 border-pink-100 hover:shadow-xl transition-shadow">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-black text-gray-900 flex items-center">
              <span class="w-2 h-8 bg-gradient-to-b from-pink-500 to-orange-500 rounded-full mr-3"></span>
              Weekly Attendance
            </h3>
            <p class="text-sm text-gray-600 ml-5">Student attendance overview</p>
          </div>
          <div class="flex gap-4">
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full"></div>
              <span class="text-xs font-semibold text-gray-600">Present</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full"></div>
              <span class="text-xs font-semibold text-gray-600">Absent</span>
            </div>
          </div>
        </div>

        <!-- Chart -->
        <div class="h-64 flex items-end justify-between gap-4">
          <div class="flex-1 flex flex-col items-center gap-2 group">
            <div class="w-full relative">
              <div class="w-full h-40 bg-gradient-to-t from-pink-500 to-pink-400 rounded-t-2xl group-hover:scale-105 transition-transform shadow-lg"></div>
              <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white px-3 py-1 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">142</div>
            </div>
            <div class="w-full h-4 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg group-hover:scale-105 transition-transform"></div>
            <span class="text-xs font-bold text-gray-600 mt-2">Mon</span>
          </div>
          
          <div class="flex-1 flex flex-col items-center gap-2 group">
            <div class="w-full relative">
              <div class="w-full h-44 bg-gradient-to-t from-pink-500 to-pink-400 rounded-t-2xl group-hover:scale-105 transition-transform shadow-lg"></div>
              <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white px-3 py-1 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">145</div>
            </div>
            <div class="w-full h-3 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg group-hover:scale-105 transition-transform"></div>
            <span class="text-xs font-bold text-gray-600 mt-2">Tue</span>
          </div>
          
          <div class="flex-1 flex flex-col items-center gap-2 group">
            <div class="w-full relative">
              <div class="w-full h-48 bg-gradient-to-t from-pink-500 to-pink-400 rounded-t-2xl group-hover:scale-105 transition-transform shadow-lg"></div>
              <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white px-3 py-1 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">148</div>
            </div>
            <div class="w-full h-2 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg group-hover:scale-105 transition-transform"></div>
            <span class="text-xs font-bold text-gray-600 mt-2">Wed</span>
          </div>
          
          <div class="flex-1 flex flex-col items-center gap-2 group">
            <div class="w-full relative">
              <div class="w-full h-46 bg-gradient-to-t from-pink-500 to-pink-400 rounded-t-2xl group-hover:scale-105 transition-transform shadow-lg"></div>
              <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white px-3 py-1 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">147</div>
            </div>
            <div class="w-full h-3 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg group-hover:scale-105 transition-transform"></div>
            <span class="text-xs font-bold text-gray-600 mt-2">Thu</span>
          </div>
          
          <div class="flex-1 flex flex-col items-center gap-2 group">
            <div class="w-full relative">
              <div class="w-full h-52 bg-gradient-to-t from-pink-500 to-pink-400 rounded-t-2xl group-hover:scale-105 transition-transform shadow-lg"></div>
              <div class="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white px-3 py-1 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">150</div>
            </div>
            <div class="w-full h-1 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg group-hover:scale-105 transition-transform"></div>
            <span class="text-xs font-bold text-gray-600 mt-2">Fri</span>
          </div>
        </div>
      </div>

      <!-- Class Distribution -->
      <div class="bg-white rounded-3xl p-8 shadow-sm border-4 border-purple-100 hover:shadow-xl transition-shadow">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-black text-gray-900 flex items-center">
              <span class="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></span>
              Class Distribution
            </h3>
            <p class="text-sm text-gray-600 ml-5">Students per class level</p>
          </div>
        </div>

        <div class="space-y-6">
          <!-- Petite Section -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <div class="text-2xl">🎨</div>
                <div>
                  <p class="font-bold text-gray-900">Petite Section</p>
                  <p class="text-xs text-gray-600">3-4 years old</p>
                </div>
              </div>
              <span class="text-2xl font-black text-pink-600">45</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-pink-500 to-pink-600 rounded-full" style="width: 30%"></div>
            </div>
          </div>

          <!-- Moyenne Section -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <div class="text-2xl">📚</div>
                <div>
                  <p class="font-bold text-gray-900">Moyenne Section</p>
                  <p class="text-xs text-gray-600">4-5 years old</p>
                </div>
              </div>
              <span class="text-2xl font-black text-orange-600">55</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full" style="width: 37%"></div>
            </div>
          </div>

          <!-- Grande Section -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <div class="text-2xl">🎓</div>
                <div>
                  <p class="font-bold text-gray-900">Grande Section</p>
                  <p class="text-xs text-gray-600">5-6 years old</p>
                </div>
              </div>
              <span class="text-2xl font-black text-purple-600">50</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" style="width: 33%"></div>
            </div>
          </div>
        </div>

        <!-- Total -->
        <div class="mt-6 pt-6 border-t-2 border-gray-100">
          <div class="flex items-center justify-between">
            <p class="text-lg font-black text-gray-900">Total Students</p>
            <p class="text-3xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">150</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions & Upcoming Events -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      
      <!-- Quick Actions - 2 columns -->
      <div class="lg:col-span-2">
        <h3 class="text-xl font-black text-gray-900 mb-4 flex items-center">
          <span class="w-2 h-8 bg-gradient-to-b from-pink-500 to-orange-500 rounded-full mr-3"></span>
          Quick Actions
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a routerLink="/admin/classes/create" 
             class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 hover:shadow-xl transition-all text-center group border-4 border-blue-200 transform hover:-translate-y-2">
            <div class="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </div>
            <p class="text-sm font-black text-gray-900">Add Student</p>
            <p class="text-xs text-gray-600 mt-1">Enroll new</p>
          </a>

          <a routerLink="/admin/educateurs/create" 
             class="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-6 hover:shadow-xl transition-all text-center group border-4 border-green-200 transform hover:-translate-y-2">
            <div class="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </div>
            <p class="text-sm font-black text-gray-900">Add Teacher</p>
            <p class="text-xs text-gray-600 mt-1">Hire new</p>
          </a>

          <a routerLink="/admin/activites/create" 
             class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 hover:shadow-xl transition-all text-center group border-4 border-purple-200 transform hover:-translate-y-2">
            <div class="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </div>
            <p class="text-sm font-black text-gray-900">Add Activity</p>
            <p class="text-xs text-gray-600 mt-1">Plan new</p>
          </a>

          <a routerLink="/admin/menus/create" 
             class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-3xl p-6 hover:shadow-xl transition-all text-center group border-4 border-yellow-200 transform hover:-translate-y-2">
            <div class="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
            </div>
            <p class="text-sm font-black text-gray-900">Create Menu</p>
            <p class="text-xs text-gray-600 mt-1">Food plan</p>
          </a>
        </div>
      </div>

      <!-- Upcoming Events -->
      <div class="bg-white rounded-3xl p-6 shadow-sm border-4 border-orange-100">
        <h3 class="text-xl font-black text-gray-900 mb-4 flex items-center">
          <span class="w-2 h-8 bg-gradient-to-b from-orange-500 to-yellow-500 rounded-full mr-3"></span>
          Today's Events
        </h3>
        <div class="space-y-4">
          <div class="flex items-start gap-3 p-3 bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl border-2 border-pink-200">
            <div class="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span class="text-xl">🎨</span>
            </div>
            <div class="flex-1">
              <p class="text-sm font-bold text-gray-900">Art Class</p>
              <p class="text-xs text-gray-600">10:00 AM - Room A</p>
            </div>
          </div>

          <div class="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span class="text-xl">🎵</span>
            </div>
            <div class="flex-1">
              <p class="text-sm font-bold text-gray-900">Music Time</p>
              <p class="text-xs text-gray-600">2:00 PM - Hall</p>
            </div>
          </div>

          <div class="flex items-start gap-3 p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border-2 border-green-200">
            <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span class="text-xl">⚽</span>
            </div>
            <div class="flex-1">
              <p class="text-sm font-bold text-gray-900">Outdoor Play</p>
              <p class="text-xs text-gray-600">3:30 PM - Playground</p>
            </div>
          </div>

          <div class="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <span class="text-xl">📚</span>
            </div>
            <div class="flex-1">
              <p class="text-sm font-bold text-gray-900">Story Time</p>
              <p class="text-xs text-gray-600">4:00 PM - Library</p>
            </div>
          </div>
        </div>

        <a routerLink="/admin/events" 
           class="mt-4 block text-center text-sm font-bold text-pink-600 hover:text-pink-700 transition">
          View All Events →
        </a>
      </div>
    </div>

    <!-- Recent Enrollments -->
    <div class="bg-white rounded-3xl p-8 shadow-sm border-4 border-blue-100">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h3 class="text-xl font-black text-gray-900 flex items-center">
            <span class="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></span>
            Recent Enrollments
          </h3>
          <p class="text-sm text-gray-600 ml-5">Latest student registrations</p>
        </div>
        <a routerLink="/admin/inscriptions" 
           class="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-full font-bold text-sm hover:shadow-xl transition-all transform hover:scale-105">
          View All
        </a>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b-2 border-gray-200">
              <th class="text-left py-4 px-4 text-sm font-black text-gray-700 uppercase tracking-wider">Student</th>
              <th class="text-left py-4 px-4 text-sm font-black text-gray-700 uppercase tracking-wider">Class</th>
              <th class="text-left py-4 px-4 text-sm font-black text-gray-700 uppercase tracking-wider">Parent</th>
              <th class="text-left py-4 px-4 text-sm font-black text-gray-700 uppercase tracking-wider">Date</th>
              <th class="text-left py-4 px-4 text-sm font-black text-gray-700 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-gray-100 hover:bg-gradient-to-r hover:from-pink-50 hover:to-orange-50 transition">
              <td class="py-4 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    MS
                  </div>
                  <div>
                    <p class="font-bold text-gray-900">Mohamed Salah</p>
                    <p class="text-xs text-gray-600">4 years old</p>
                  </div>
                </div>
              </td>
              <td class="py-4 px-4">
                <span class="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">Moyenne Section</span>
              </td>
              <td class="py-4 px-4">
                <p class="font-semibold text-gray-900">Ahmed Salah</p>
                <p class="text-xs text-gray-600">+216 XX XXX XXX</p>
              </td>
              <td class="py-4 px-4 text-sm text-gray-600">Dec 8, 2024</td>
              <td class="py-4 px-4">
                <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">✓ Approved</span>
              </td>
            </tr>

            <tr class="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition">
              <td class="py-4 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    LB
                  </div>
                  <div>
                    <p class="font-bold text-gray-900">Leila Ben Ali</p>
                    <p class="text-xs text-gray-600">3 years old</p>
                  </div>
                </div>
              </td>
              <td class="py-4 px-4">
                <span class="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold">Petite Section</span>
              </td>
              <td class="py-4 px-4">
                <p class="font-semibold text-gray-900">Fatma Ben Ali</p>
                <p class="text-xs text-gray-600">+216 XX XXX XXX</p>
              </td>
              <td class="py-4 px-4 text-sm text-gray-600">Dec 9, 2024</td>
              <td class="py-4 px-4">
                <span class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">⏳ Pending</span>
              </td>
            </tr>

            <tr class="hover:bg-gradient-to-r hover:from-green-50 hover:to-teal-50 transition">
              <td class="py-4 px-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                    YT
                  </div>
                  <div>
                    <p class="font-bold text-gray-900">Youssef Trabelsi</p>
                    <p class="text-xs text-gray-600">5 years old</p>
                  </div>
                </div>
              </td>
              <td class="py-4 px-4">
                <span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">Grande Section</span>
              </td>
              <td class="py-4 px-4">
                <p class="font-semibold text-gray-900">Karim Trabelsi</p>
                <p class="text-xs text-gray-600">+216 XX XXX XXX</p>
              </td>
              <td class="py-4 px-4 text-sm text-gray-600">Dec 10, 2024</td>
              <td class="py-4 px-4">
                <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">✓ Approved</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    @keyframes bounce-slow {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    .animate-bounce-slow {
      animation: bounce-slow 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-20px);
      }
    }

    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
  `]
})
export class AdminDashboardComponent {
  stats = signal({
    students: 150,
    teachers: 25,
    parents: 280,
    activities: 12
  });

  getUserName(): string {
    return localStorage.getItem('sk_user_name') || 'Admin';
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}