import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { z } from "zod";

// Professional validation schema (matching parent component)
const formSchema = z.object({
  clientType: z.enum(["particulier", "professionnel", "collectivite"]),
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  email: z.string().email("L'email doit être valide"),
  phone: z.string().refine((value) => {
    const cleanPhone = value.replace(/[\s\.\-]/g, '');
    return /^(0[1-9]\d{8}|\+33[1-9]\d{8})$/.test(cleanPhone);
  }, "Format téléphone invalide (ex: 06 12 34 56 78)"),
  raisonSociale: z.string().optional(),
  siren: z.string().optional(),
  nomCollectivite: z.string().optional(),
  sirenCollectivite: z.string().optional(),
  adresse: z.string().optional(),
  complementAdresse: z.string().optional(),
  codePostal: z.string().optional(),
  ville: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface FormStep1Props {
  form: UseFormReturn<FormData>;
}

export function FormStep1({ form }: FormStep1Props) {
  const clientType = form.watch("clientType");

  return (
    <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 p-2 md:p-8">
      {/* Header */}
      <div className="mb-1 md:mb-6">
        <h2 className="text-base md:text-2xl font-semibold text-gray-900 mb-0.5 tracking-tight">
          Informations personnelles
        </h2>
        <p className="text-xs md:text-sm text-gray-600 leading-tight md:leading-normal">
          Remplissez vos coordonnées personnelles pour traiter votre demande de raccordement électrique.
        </p>
      </div>
      
      <div className="space-y-1 md:space-y-3">
        {/* Type de client - Mobile/Desktop optimized */}
        <FormField
          control={form.control}
          name="clientType"
          render={({ field }) => (
            <FormItem className="space-y-0.5">
              <FormLabel className="text-xs md:text-base font-medium text-gray-700 flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                <span>Type de client *</span>
              </FormLabel>
              <FormControl>
                <div>
                  {/* Mobile Dropdown */}
                  <div className="block md:hidden">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="min-h-[64px] h-16 w-full bg-white border-2 border-gray-300 rounded-2xl shadow-sm hover:border-blue-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-700 font-medium text-base px-4 py-3 cursor-pointer active:scale-[0.98] touch-manipulation">
                        <div className="flex items-center gap-4 w-full">
                          {field.value === "particulier" && (
                            <>
                              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">Particulier</div>
                                <div className="text-sm text-gray-600">Raccordement résidentiel</div>
                              </div>
                            </>
                          )}
                          {field.value === "professionnel" && (
                            <>
                              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">Professionnel</div>
                                <div className="text-sm text-gray-600">Entreprise ou commerce</div>
                              </div>
                            </>
                          )}
                          {field.value === "collectivite" && (
                            <>
                              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">Collectivité</div>
                                <div className="text-sm text-gray-600">Institution publique</div>
                              </div>
                            </>
                          )}
                          {!field.value && (
                            <>
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                              <span className="text-gray-500 font-medium">Sélectionnez votre type de client</span>
                            </>
                          )}
                        </div>
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-gray-200 rounded-2xl shadow-2xl mt-3 z-50 max-h-[280px] overflow-y-auto">
                        <SelectItem value="particulier" className="px-4 py-3 hover:bg-blue-50 cursor-pointer touch-manipulation min-h-[60px] focus:bg-blue-50 active:bg-blue-100 transition-all duration-200 rounded-lg mx-0 my-1 border-2 border-transparent hover:border-blue-300 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-50">
                          <div className="flex items-center gap-3 w-full relative">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm">Particulier</div>
                              <div className="text-xs text-gray-600">Domicile résidentiel</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="professionnel" className="px-4 py-3 hover:bg-orange-50 cursor-pointer touch-manipulation min-h-[60px] focus:bg-orange-50 active:bg-orange-100 transition-all duration-200 rounded-lg mx-0 my-1 border-2 border-transparent hover:border-orange-300 data-[state=checked]:border-orange-600 data-[state=checked]:bg-orange-50">
                          <div className="flex items-center gap-3 w-full relative">
                            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm">Professionnel</div>
                              <div className="text-xs text-gray-600">Entreprise & commerce</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="collectivite" className="px-4 py-3 hover:bg-green-50 cursor-pointer touch-manipulation min-h-[60px] focus:bg-green-50 active:bg-green-100 transition-all duration-200 rounded-lg mx-0 my-1 border-2 border-transparent hover:border-green-300 data-[state=checked]:border-green-600 data-[state=checked]:bg-green-50">
                          <div className="flex items-center gap-3 w-full relative">
                            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm">Collectivité</div>
                              <div className="text-xs text-gray-600">Entité publique</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Desktop Card Layout */}
                  <div className="hidden md:block">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      {/* Particulier Card */}
                      <div
                        onClick={() => field.onChange("particulier")}
                        className={`relative cursor-pointer border-2 rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                          field.value === "particulier" 
                            ? 'border-blue-600 bg-blue-50' 
                            : 'border-gray-300 bg-white hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            field.value === "particulier" 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm">Particulier</h3>
                            <p className="text-xs text-gray-600">Domicile résidentiel</p>
                          </div>
                        </div>
                      </div>

                      {/* Professionnel Card */}
                      <div
                        onClick={() => field.onChange("professionnel")}
                        className={`relative cursor-pointer border-2 rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                          field.value === "professionnel" 
                            ? 'border-orange-600 bg-orange-50' 
                            : 'border-gray-300 bg-white hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            field.value === "professionnel" 
                              ? 'bg-orange-600 text-white' 
                              : 'bg-orange-100 text-orange-600'
                          }`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm">Professionnel</h3>
                            <p className="text-xs text-gray-600">Entreprise & commerce</p>
                          </div>
                        </div>
                      </div>

                      {/* Collectivité Card */}
                      <div
                        onClick={() => field.onChange("collectivite")}
                        className={`relative cursor-pointer border-2 rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                          field.value === "collectivite" 
                            ? 'border-green-600 bg-green-50' 
                            : 'border-gray-300 bg-white hover:border-green-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            field.value === "collectivite" 
                              ? 'bg-green-600 text-white' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm">Collectivité</h3>
                            <p className="text-xs text-gray-600">Entité publique</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form fields grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-4">
          {/* Nom */}
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem className="space-y-0.5">
                <FormLabel className="text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Nom *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Votre nom de famille"
                    className="h-10 md:h-12 bg-white border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm md:text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Prénom */}
          <FormField
            control={form.control}
            name="prenom"
            render={({ field }) => (
              <FormItem className="space-y-0.5">
                <FormLabel className="text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Prénom *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Votre prénom"
                    className="h-10 md:h-12 bg-white border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm md:text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Email and Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-0.5">
                <FormLabel className="text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Email *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="votre@email.com"
                    className="h-10 md:h-12 bg-white border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm md:text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="space-y-0.5">
                <FormLabel className="text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Téléphone *
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    placeholder="06 12 34 56 78"
                    className="h-10 md:h-12 bg-white border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm md:text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Conditional fields based on client type */}
        {clientType === "professionnel" && (
          <div className="space-y-1 md:space-y-3 pt-2 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 text-sm md:text-base mb-1">Informations professionnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-4">
              <FormField
                control={form.control}
                name="raisonSociale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs md:text-sm font-medium text-gray-700">Raison sociale</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nom de votre entreprise"
                        className="h-10 md:h-12 bg-white border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm md:text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siren"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs md:text-sm font-medium text-gray-700">SIREN</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="123 456 789"
                        className="h-10 md:h-12 bg-white border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm md:text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {clientType === "collectivite" && (
          <div className="space-y-1 md:space-y-3 pt-2 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 text-sm md:text-base mb-1">Informations de la collectivité</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-4">
              <FormField
                control={form.control}
                name="nomCollectivite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs md:text-sm font-medium text-gray-700">Nom de la collectivité</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nom de la collectivité"
                        className="h-10 md:h-12 bg-white border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm md:text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sirenCollectivite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs md:text-sm font-medium text-gray-700">SIREN</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="123 456 789"
                        className="h-10 md:h-12 bg-white border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm md:text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}