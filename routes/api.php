<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PasteStreamsController;
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/', [PasteStreamsController::class, 'store'])->middleware('auth:sanctum')->name('paste.store');
Route::put('/{uuid}', [PasteStreamsController::class, 'update'])->middleware('auth:sanctum')->name('paste.update');
