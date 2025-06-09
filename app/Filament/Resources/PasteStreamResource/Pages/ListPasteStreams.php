<?php

namespace App\Filament\Resources\PasteStreamResource\Pages;

use App\Filament\Resources\PasteStreamResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListPasteStreams extends ListRecords
{
    protected static string $resource = PasteStreamResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
