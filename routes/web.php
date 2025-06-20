<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\PasteStreamsController;

Route::get('/', [PasteStreamsController::class, 'index'])->name('home');
Route::get('/{slug}/', [PasteStreamsController::class, 'show'])->name('stream.show');
Route::get('/{pasteStream}/download', [PasteStreamsController::class, 'download'])->name('stream.download');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
