<?php

namespace App\Filament\Resources\PasteStreams;

use App\Filament\Resources\PasteStreams\Pages\CreatePasteStream;
use App\Filament\Resources\PasteStreams\Pages\EditPasteStream;
use App\Filament\Resources\PasteStreams\Pages\ListPasteStreams;
use App\Filament\Resources\PasteStreams\Pages\ViewPasteStream;
use App\Filament\Resources\PasteStreams\Schemas\PasteStreamForm;
use App\Filament\Resources\PasteStreams\Schemas\PasteStreamInfolist;
use App\Filament\Resources\PasteStreams\Tables\PasteStreamsTable;
use App\Models\PasteStream;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PasteStreamResource extends Resource
{
    protected static ?string $model = PasteStream::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return PasteStreamForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return PasteStreamInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PasteStreamsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListPasteStreams::route('/'),
            'create' => CreatePasteStream::route('/create'),
            'view' => ViewPasteStream::route('/{record}'),
            'edit' => EditPasteStream::route('/{record}/edit'),
        ];
    }
}
