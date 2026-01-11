import { Module } from "@nestjs/common";
import { PdfModule, ImageModule } from "@converter/backend-lib";

@Module({
  imports: [PdfModule, ImageModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
