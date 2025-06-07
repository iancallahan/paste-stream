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
        $items = collect($pasteStream->pastes ?? [])
            ->sortByDesc('created_at')
            ->values()
            ->all();

        return Inertia::render('stream', [
            'pasteStream' => [
                'items' => $items,
                'uuid' => $pasteStream->uuid,
                'id' => $pasteStream->id,
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

        $content = $request->content;

        if($request->has('encoding') && $request->encoding === 'base64' ) {
            $content = base64_decode($content);
        }

        $update = [
            'content' => $content,
            'created_at' => [
                'date' => now()->toDateTimeString(),
                'timezone_type' => 3,
                'timezone' => 'UTC'
            ]
        ];

        $pasteStream->update([
            'pastes' => collect($pasteStream->pastes ?? [])->push($update)->all()
        ]);

        try {
            event(new PasteUpdated($update, $uuid));
            \Log::info('PasteUpdated event dispatched successfully');
        } catch (\Exception $e) {
            \Log::error('Failed to dispatch PasteUpdated event', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }

        return response()->json($pasteStream);
    }

    public function download(Request $request, PasteStream $pasteStream)
    {
        return response()->json($pasteStream);
    }

    public function show($slug)
    {
        $pasteStream = PasteStream::where('slug', $slug)->first();
        return Inertia::render('stream', [
            'pasteStream' => $pasteStream
        ]);
    }
}
