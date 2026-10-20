import { getUser } from "@/features/profile/services/profile.service";
import { Generator } from "@/shared/components/seo/image-metadata/commons/generator/generator";
import { UserImageMetadata } from "@/shared/components/seo/image-metadata/user/user-image-metadata";

//export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};
export const alt = "goha.et user preview";

export default async function Image({
  params,
}: {
  params: { userId: string };
}) {
  try {
    const user = await getUser(params.userId);

    return Generator({
      children: (
        <UserImageMetadata
          name={user.name}
          description={user.bio || ""}
          imageUrl={user.image}
        />
      ),
    });
  } catch (error) {
    console.error("Failed to generate project metadata image:", error);

    return Generator({
      children: (
        <UserImageMetadata
          name="goha.et"
          description="Discover the models, datasets and research shaping Ethiopian AI."
          imageUrl=""
        />
      ),
    });
  }
}
