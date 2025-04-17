import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Settings, Sun, Moon, Laptop } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useTheme } from "next-themes"
import { exportWorkoutData, importWorkoutData } from "@/lib/workout-data"
import { Separator } from "@radix-ui/react-separator"

export function SettingsSheet() {
    const { setTheme, theme } = useTheme()

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Settings className="h-[1.2rem] w-[1.2rem]" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px]">
                <SheetHeader className="pt-3">
                    <SheetTitle>
                        <div className="text-xl font-semibold flex justify-center">
                            Settings
                        </div>
                    </SheetTitle>
                </SheetHeader>

                <div className="grid gap-4 p-4">
                    {/* Settings sections */}
                    <div className="space-y-4">
                        <h3 className="font-medium">Appearance</h3>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Theme</span>
                            <ToggleGroup type="single" value={theme} onValueChange={setTheme}>
                                <ToggleGroupItem size="lg" variant="outline" className="px-4" value="light" aria-label="Light">
                                    <Sun className="h-4 w-4" />
                                </ToggleGroupItem>
                                <ToggleGroupItem size="lg" variant="outline" className="px-4" value="dark" aria-label="Dark">
                                    <Moon className="h-4 w-4" />
                                </ToggleGroupItem>
                                <ToggleGroupItem size="lg" variant="outline" className="px-4" value="system" aria-label="System">
                                    <Laptop className="h-4 w-4" />
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-4">
                        <h3 className="font-medium">Data</h3>
                        <div className="flex flex-col gap-4">
                            <div>
                                <Button
                                    onClick={exportWorkoutData}
                                    className="w-full"
                                >
                                    Export Workout Data
                                </Button>
                            </div>

                            <div className="flex flex-col gap-2">
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={importWorkoutData}
                                    className="hidden"
                                    id="import-file"
                                />
                                <Button
                                    onClick={() => document.getElementById('import-file')?.click()}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Import Workout Data
                                </Button>
                                <p className="text-sm text-muted-foreground">
                                    Select a previously exported workout data file to import
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Add more settings sections as needed */}
                </div>
            </SheetContent>
        </Sheet>
    )
}

