import { IconButton, MenuItem, Stack, SvgIcon, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { Formik, FormikProps, FormikValues, useFormikContext } from "formik";
import { z } from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { Contract, Deal, Honors, Side } from "./types";
import FormikTextField from "./FormikTextField";
import PlusIcon from "@heroicons/react/24/solid/PlusCircleIcon";

const formSchema = z.object({
  declarer: z.nativeEnum(Side),
  contract: z.string().refine((v) => !!Contract.parse(v), { message: "Invalid contract" }),
  tricks: z.number(),
  honors: z.nativeEnum(Honors).optional(),
});

type Form = z.infer<typeof formSchema>;

function getDeal(values: FormikProps<Form>["values"]): Deal | undefined {
  const contract = Contract.parse(values.contract);
  if (!contract) return undefined;
  return new Deal(values.declarer, contract, values.tricks, values.honors);
}

function TrickSelector({ from, to }: { from: number; to: number }) {
  const formik = useFormikContext<Form>();
  return (
    <ToggleButtonGroup
      exclusive
      value={formik.values.tricks}
      onChange={(_, v) => v !== undefined && formik.setFieldValue("tricks", v)}
    >
      {Array.from({ length: to - from + 1 }, (_, index) => index + from).map((v) => (
        <ToggleButton value={v} key={v} sx={{ width: 28, height: 28 }}>
          <Typography variant="caption">{v}</Typography>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

function DealInputForm(props: DealInputProps) {
  const formik = useFormikContext<Form>();
  return (
    <Stack direction="row" alignItems="start" spacing={1}>
      <FormikTextField select name="declarer" label="Declarer" helperText={undefined} sx={{ width: 120 }}>
        {Object.values(Side).map((side) => (
          <MenuItem key={side} value={side}>
            {side}
          </MenuItem>
        ))}
      </FormikTextField>
      <FormikTextField
        label="Contract"
        name="contract"
        sx={{ width: 80 }}
        helperText={Contract.parse(formik.values.contract)?.toSymbol()}
        onChange={(evt) => {
          if (Contract.MASK.test(evt.target.value)) formik.setFieldValue("contract", evt.target.value);
        }}
      />
      <Stack>
        <TrickSelector from={0} to={6} />
        <TrickSelector from={7} to={13} />
      </Stack>
      <ToggleButtonGroup
        exclusive
        value={formik.values.honors}
        orientation="vertical"
        onChange={(_, v) => formik.setFieldValue("honors", v)}
      >
        {Object.values(Honors).map((honor) => (
          <ToggleButton key={honor} value={honor} sx={{ width: 28, height: 28 }}>
            <Typography variant="caption">{honor}</Typography>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <IconButton aria-label="add" disabled={!formik.isValid} onClick={formik.submitForm}>
        <SvgIcon>
          <PlusIcon />
        </SvgIcon>
      </IconButton>
    </Stack>
  );
}

export type DealInputProps = {
  onDeal: (deal: Deal) => void;
};

export default function DealInput(props: DealInputProps) {
  return (
    <Formik<Form>
      initialValues={{
        declarer: Side.NorthSouth,
        contract: "",
        tricks: undefined as any,
        honors: undefined as any,
      }}
      validationSchema={toFormikValidationSchema(formSchema)}
      onSubmit={(values, { resetForm }) => {
        props.onDeal(getDeal(values)!);
        resetForm();
      }}
    >
      <DealInputForm {...props} />
    </Formik>
  );
}
