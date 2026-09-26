# Brand name in user-visible text is «Aprosop» (capital A); domains/URLs stay lowercase.

import re

from django.db import migrations, models

BRAND = re.compile(r"(?<![\w./@:-])aprosop(?![\w.:-])")
ARTICLE_FIELDS = ("title", "summary", "body", "author_name", "when_to_seek_help")
PRACTICE_FIELDS = ("title", "summary", "mechanism", "cautions")


def capitalise(apps, schema_editor):
    for model, fields in (("Article", ARTICLE_FIELDS), ("Practice", PRACTICE_FIELDS)):
        Model = apps.get_model("content", model)
        for obj in Model.objects.all():
            changed = []
            for f in fields:
                value = getattr(obj, f, None)
                if isinstance(value, str) and BRAND.search(value):
                    setattr(obj, f, BRAND.sub("Aprosop", value))
                    changed.append(f)
            if changed:
                Model.objects.filter(pk=obj.pk).update(**{f: getattr(obj, f) for f in changed})


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0004_evidence_based_texts"),
    ]

    operations = [
        migrations.AlterField(
            model_name="article",
            name="author_name",
            field=models.CharField(blank=True, default="Редакция Aprosop", max_length=120),
        ),
        migrations.RunPython(capitalise, migrations.RunPython.noop),
    ]
