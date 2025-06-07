<?php

namespace App\Filament\Resources\PasteStreams\Schemas;

use Filament\Infolists\Components\IconEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Schema;

class PasteStreamInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextEntry::make('created_at')
                    ->dateTime(),
                TextEntry::make('updated_at')
                    ->dateTime(),
                TextEntry::make('title'),
                TextEntry::make('description'),
                IconEntry::make('public')
                    ->boolean(),
                TextEntry::make('uuid')
                    ->label('UUID'),
                IconEntry::make('default')
                    ->boolean(),
            ]);
    }
}
