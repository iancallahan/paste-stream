<?php

namespace App\Filament\Resources\PasteStreams\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class PasteStreamForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('title')
                    ->required(),
                Textarea::make('description')
                    ->required()
                    ->columnSpanFull(),
                TextInput::make('slug')
                    ->label('Slug')
                    ->required()
                    ->columnSpanFull(),
                Textarea::make('pastes')
                    ->columnSpanFull(),
                TextInput::make('uuid')
                    ->label('UUID')
                    ->default(fn () => (string) Str::uuid())
                    ->required()
                    ->columnSpanFull(),
                Toggle::make('public')
                    ->required(),
                Toggle::make('default')
                    ->required(),

            ]);
    }
}
