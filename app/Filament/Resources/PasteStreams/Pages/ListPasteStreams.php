<?php

namespace App\Filament\Resources\PasteStreams\Pages;

use App\Filament\Resources\PasteStreams\PasteStreamResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPasteStreams extends ListRecords
{
    protected static string $resource = PasteStreamResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
