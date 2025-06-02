<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PasteStream;
use Inertia\Inertia;
use App\Events\PasteUpdated;

class PasteStreamsController extends Controller
{
    public function index()
    {
        $pasteStream = PasteStream::where('default', true)->first();

        // Ensure pastes is an array and sort by created_at
        $items = collect($pasteStream->pastes ?? [])
            ->sortByDesc('created_at')
            ->values()
            ->all();

        return Inertia::render('stream', [
            'pasteStream' => [
                'items' => $items,
                'uuid' => $pasteStream->uuid,
                'title' => $pasteStream->title,
                'description' => $pasteStream->description
            ]
        ]);
    }

    public function store(Request $request)
    {
        $pasteStream = PasteStream::create($request->all());
        return response()->json($pasteStream);
    }

    public function update(Request $request, $uuid)
    {
        $pasteStream = PasteStream::where('uuid', $uuid)->first();
        $update = [
            'content' => $request->content,
            'created_at' => [
                'date' => now()->toDateTimeString(),
                'timezone_type' => 3,
                'timezone' => 'UTC'
            ]
        ];

        // Add more detailed debugging
        \Log::info('Starting PasteUpdated process', [
            'update' => $update,
            'uuid' => $uuid,
            'broadcast_driver' => config('broadcasting.default'),
            'connections' => config('broadcasting.connections'),
            'channel' => 'paste-stream.' . $uuid
        ]);

        // Use push() to append to JSON array
        $pasteStream->update([
            'pastes' => collect($pasteStream->pastes ?? [])->push($update)->all()
        ]);

        try {
            // Dispatch synchronously instead of asynchronously
            event(new PasteUpdated($update, $uuid));
            // Or alternatively:
            // broadcast(new PasteUpdated($update, $uuid))->toOthers();

            \Log::info('PasteUpdated event dispatched successfully');
        } catch (\Exception $e) {
            \Log::error('Failed to dispatch PasteUpdated event', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }

        return response()->json($pasteStream);
    }

    public function download(Request $request, $uuid)
    {
        $pasteStream = PasteStream::where('uuid', $uuid)->first();
        return response()->json($pasteStream);
    }


}
