<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PasteUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $paste;
    public $streamUuid;

    public function __construct($paste, $streamUuid)
    {
        $this->paste = $paste;
        $this->streamUuid = $streamUuid;
        \Log::info('PasteUpdated event constructed', [
            'paste' => $paste,
            'streamUuid' => $streamUuid
        ]);
    }

    public function broadcastOn()
    {
        $channel = 'paste-stream.' . $this->streamUuid;
        \Log::info('Broadcasting on channel', ['channel' => $channel]);
        return new Channel($channel);
    }

    public function broadcastAs()
    {
        \Log::info('Broadcasting as paste.updated');
        return 'paste.updated';
    }

    public function broadcastWith()
    {
        \Log::info('Broadcasting with data', [
            'data' => [
                'paste' => $this->paste,
                'streamUuid' => $this->streamUuid
            ]
        ]);

        return [
            'paste' => $this->paste,
            'streamUuid' => $this->streamUuid
        ];
    }
}
