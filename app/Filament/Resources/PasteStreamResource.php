<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PasteStreamResource\Pages;
use App\Filament\Resources\PasteStreamResource\RelationManagers;
use App\Models\PasteStream;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Repeater;
use Illuminate\Support\Str;

class PasteStreamResource extends Resource
{
    protected static ?string $model = PasteStream::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                    TextInput::make('title')
                        ->required(),
                    Textarea::make('description')
                        ->required()
                        ->columnSpanFull(),
                    TextInput::make('slug')
                        ->label('Slug')
                        ->required()
                        ->columnSpanFull(),
                    Repeater::make('pastes')
                        ->schema([
                            Textarea::make('content')
                                ->required()
                                ->label('Content'),
                            TextInput::make('label'),
                            DateTimePicker::make('created_at.date')
                                ->required()
                                ->timezone('UTC')
                                ->displayFormat('Y-m-d H:i:s'),
                            Hidden::make('created_at.timezone_type')
                                ->default(3),
                            Hidden::make('created_at.timezone')
                                ->default('UTC')
                        ])
                        ->defaultItems(0)
                        ->createItemButtonLabel('Add Paste')
                        ->reactive(),
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

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('title')
                    ->searchable(),
                Tables\Columns\TextColumn::make('description')
                    ->searchable(),
                Tables\Columns\IconColumn::make('public')
                    ->boolean(),
                Tables\Columns\TextColumn::make('uuid')
                    ->label('UUID')
                    ->searchable(),
                Tables\Columns\TextColumn::make('slug')
                    ->searchable(),
                Tables\Columns\IconColumn::make('default')
                    ->boolean(),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
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
            'index' => Pages\ListPasteStreams::route('/'),
            'create' => Pages\CreatePasteStream::route('/create'),
            'edit' => Pages\EditPasteStream::route('/{record}/edit'),
        ];
    }
}
